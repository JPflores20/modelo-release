import { useState, useCallback } from "react";
import Header from "@/components/Header";
import ConfigurationCard from "@/components/ConfigurationCard";
import OrdersGrid from "@/components/OrdersGrid";
import ActivityLog from "@/components/ActivityLog";
import DashboardMetrics from "@/components/DashboardMetrics"; // Importamos las métricas
import { Button } from "@/components/ui/button";
import { Loader2, Send, AlertTriangle } from "lucide-react";
import { Order, ReleaseMode, LogEntry } from "@/types/orders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Datos de ejemplo
const SAMPLE_ORDERS: Order[] = [
  {
    id: "ORD-001",
    producto: "CORO-001",
    descripcion: "Corona Extra 355ml",
    lote: "L2024-001",
    prehop: "PH-01",
    descOrder: "DO-1234",
    casa: "PLT-01",
    linea: "L-01",
    bateria: "B-001",
    estatus: "pendiente",
  },
  {
    id: "ORD-002",
    producto: "CORO-002",
    descripcion: "Corona Light 355ml",
    lote: "L2024-001",
    prehop: "PH-01",
    descOrder: "DO-1235",
    casa: "PLT-01",
    linea: "L-02",
    bateria: "B-002",
    estatus: "pendiente",
  },
  {
    id: "ORD-003",
    producto: "MOD-001",
    descripcion: "Modelo Especial 355ml",
    lote: "L2024-002",
    prehop: "PH-02",
    descOrder: "DO-1236",
    casa: "PLT-02",
    linea: "L-01",
    bateria: "B-003",
    estatus: "liberado",
  },
  {
    id: "ORD-004",
    producto: "PAC-001",
    descripcion: "Pacifico Clara 355ml",
    lote: "L2024-003",
    prehop: "PH-03",
    descOrder: "DO-1237",
    casa: "PLT-01",
    linea: "L-03",
    bateria: "B-004",
    estatus: "pendiente",
  },
  {
    id: "ORD-005",
    producto: "NEG-001",
    descripcion: "Negra Modelo 355ml",
    lote: "L2024-003",
    prehop: "PH-03",
    descOrder: "DO-1238",
    casa: "PLT-02",
    linea: "L-02",
    bateria: "B-005",
    estatus: "pendiente",
  },
];

const Dashboard = () => {
  const [releaseMode, setReleaseMode] = useState<ReleaseMode>("identicos");
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isReleasing, setIsReleasing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Estado para el modal
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init-1",
      timestamp: new Date(),
      message: "Sistema iniciado correctamente.",
      type: "info",
    },
    {
      id: "init-2",
      timestamp: new Date(),
      message: "Conexión RFC establecida con SAP.",
      type: "success",
    },
  ]);
  const [isConnected] = useState(true);

  const addLog = useCallback(
    (message: string, type: LogEntry["type"] = "info") => {
      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        message,
        type,
      };
      setLogs((prev) => [...prev, newLog]);
    },
    []
  );

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Paso 1: Intentar liberar (abre el modal)
  const handleReleaseClick = () => {
    const ordersToRelease =
      selectedIds.size > 0
        ? orders.filter((o) => selectedIds.has(o.id) && o.estatus === "pendiente")
        : orders.filter((o) => o.estatus === "pendiente");

    if (ordersToRelease.length === 0) {
      addLog("No hay órdenes pendientes seleccionadas para liberar.", "warning");
      return;
    }

    setShowConfirmDialog(true);
  };

  // Paso 2: Ejecutar liberación real después de confirmar
  const executeRelease = async () => {
    setShowConfirmDialog(false);
    
    const ordersToRelease =
      selectedIds.size > 0
        ? orders.filter((o) => selectedIds.has(o.id) && o.estatus === "pendiente")
        : orders.filter((o) => o.estatus === "pendiente");

    setIsReleasing(true);
    addLog(`Iniciando proceso de liberación...`, "info");
    addLog(
      `Configuración seleccionada: ${
        releaseMode === "identicos" ? "Lotes Idénticos" : "Lotes Consecutivos"
      }`,
      "info"
    );
    addLog(`Órdenes a procesar: ${ordersToRelease.length}`, "info");

    await delay(500);
    addLog("Conectando con RFC...", "info");
    await delay(800);
    addLog("Conexión RFC establecida.", "success");

    for (const order of ordersToRelease) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, estatus: "procesando" } : o
        )
      );
      addLog(`Procesando orden ${order.producto} - Lote: ${order.lote}...`, "info");
      await delay(600 + Math.random() * 400);

      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, estatus: "liberado" } : o
          )
        );
        addLog(
          `Orden ${order.producto} liberada con éxito en SAP.`,
          "success"
        );
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, estatus: "error" } : o
          )
        );
        addLog(
          `Error al liberar orden ${order.producto}: Timeout en RFC.`,
          "error"
        );
      }
    }

    await delay(300);
    addLog("Proceso de liberación completado.", "success");
    setSelectedIds(new Set());
    setIsReleasing(false);
  };

  const pendingCount = orders.filter((o) => o.estatus === "pendiente").length;
  const selectedPendingCount = Array.from(selectedIds).filter((id) => {
    const order = orders.find((o) => o.id === id);
    return order?.estatus === "pendiente";
  }).length;

  const releaseCount =
    selectedIds.size > 0 ? selectedPendingCount : pendingCount;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header isConnected={isConnected} />

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6 animate-in slide-in-from-bottom-6 fade-in duration-700">
        
        {/* NUEVO: Panel de Métricas */}
        <DashboardMetrics orders={orders} />

        {/* Configuración */}
        <ConfigurationCard
          releaseMode={releaseMode}
          onReleaseModeChange={setReleaseMode}
        />

        {/* Tabla de Datos */}
        <OrdersGrid
          orders={orders}
          selectedIds={selectedIds}
          onOrdersChange={setOrders}
          onSelectionChange={setSelectedIds}
        />

        {/* Log de Actividad */}
        <ActivityLog logs={logs} />

        {/* Footer de Acciones Flotante */}
        <div className="flex items-center justify-between py-4 px-6 border border-[#FFB81C]/20 bg-white rounded-xl shadow-lg shadow-[#002855]/5 sticky bottom-4 z-10 backdrop-blur-md bg-white/90">
          <div className="text-sm text-[#002855]">
            {selectedIds.size > 0 ? (
              <span>
                <strong>{selectedIds.size}</strong> órdenes seleccionadas (
                <strong className="text-[#FFB81C]">{selectedPendingCount}</strong> pendientes)
              </span>
            ) : (
              <span>
                <strong>{pendingCount}</strong> órdenes pendientes de{" "}
                <strong>{orders.length}</strong> totales
              </span>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleReleaseClick} // Ahora llama a la función que abre el modal
            disabled={isReleasing || releaseCount === 0}
            className="bg-[#FFB81C] hover:bg-[#e5a50a] text-[#002855] font-bold px-8 gap-2 shadow-md transition-all hover:scale-105"
          >
            {isReleasing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando en SAP...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                LIBERAR ÓRDENES ({releaseCount})
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#002855] text-white/60 py-3 text-center text-xs border-t border-[#FFB81C]/30">
        © 2024 Grupo Modelo México. Sistema de Liberación de Órdenes v1.0
      </footer>

      {/* Modal de Confirmación de Seguridad */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="border-l-4 border-l-[#FFB81C]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-[#FFB81C] mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-bold uppercase tracking-wider text-xs">Confirmación de Seguridad</span>
            </div>
            <AlertDialogTitle className="text-[#002855]">
              ¿Está seguro de liberar {releaseCount} órdenes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción enviará las órdenes seleccionadas a SAP para su procesamiento inmediato. 
              Verifique que los lotes sean correctos antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-transparent hover:bg-gray-100">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeRelease}
              className="bg-[#002855] hover:bg-[#002855]/90 text-white font-bold"
            >
              Confirmar Liberación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;