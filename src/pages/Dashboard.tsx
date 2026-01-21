import { useState, useCallback } from "react";
import Header from "@/components/Header";
import ConfigurationCard from "@/components/ConfigurationCard";
import OrdersGrid from "@/components/OrdersGrid";
import ActivityLog from "@/components/ActivityLog";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { Order, ReleaseMode, LogEntry } from "@/types/orders";

// Sample data for demonstration
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

  const handleRelease = async () => {
    const ordersToRelease =
      selectedIds.size > 0
        ? orders.filter((o) => selectedIds.has(o.id) && o.estatus === "pendiente")
        : orders.filter((o) => o.estatus === "pendiente");

    if (ordersToRelease.length === 0) {
      addLog("No hay órdenes pendientes para liberar.", "warning");
      return;
    }

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
      // Update status to processing
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, estatus: "procesando" } : o
        )
      );
      addLog(`Procesando orden ${order.producto} - Lote: ${order.lote}...`, "info");
      await delay(600 + Math.random() * 400);

      // Simulate random success/failure (90% success rate)
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
    <div className="min-h-screen bg-muted flex flex-col">
      <Header isConnected={isConnected} />

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Configuration */}
        <ConfigurationCard
          releaseMode={releaseMode}
          onReleaseModeChange={setReleaseMode}
        />

        {/* Data Grid */}
        <OrdersGrid
          orders={orders}
          selectedIds={selectedIds}
          onOrdersChange={setOrders}
          onSelectionChange={setSelectedIds}
        />

        {/* Activity Log */}
        <ActivityLog logs={logs} />

        {/* Action Footer */}
        <div className="flex items-center justify-between py-4 border-t bg-card rounded-lg px-4 shadow-sm">
          <div className="text-sm text-muted-foreground">
            {selectedIds.size > 0 ? (
              <span>
                <strong>{selectedIds.size}</strong> órdenes seleccionadas (
                <strong>{selectedPendingCount}</strong> pendientes)
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
            onClick={handleRelease}
            disabled={isReleasing || releaseCount === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 gap-2"
          >
            {isReleasing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
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
      <footer className="bg-primary text-primary-foreground py-2 text-center text-xs">
        © 2024 Grupo Modelo México. Sistema de Liberación de Órdenes v1.0
      </footer>
    </div>
  );
};

export default Dashboard;
