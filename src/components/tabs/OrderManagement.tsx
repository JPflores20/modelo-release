import { useState, useCallback, useEffect } from "react";
import ConfigurationCard from "@/components/ConfigurationCard";
import OrdersGrid from "@/components/OrdersGrid";
import ActivityLog from "@/components/ActivityLog";
import DashboardMetrics from "@/components/DashboardMetrics";
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
import { toast } from "sonner";

interface OrderManagementProps {
  isConnected: boolean;
}

export function OrderManagement({ isConnected }: OrderManagementProps) {
  const [releaseMode, setReleaseMode] = useState<ReleaseMode>("identicos");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isReleasing, setIsReleasing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Estado de Logs local para este módulo
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "init-1",
      timestamp: new Date(),
      message: "Módulo de Órdenes listo.",
      type: "info",
    },
  ]);

  // Cargar logs guardados
  useEffect(() => {
    const savedLogs = localStorage.getItem("zeus_logs");
    if (savedLogs) {
        try {
            const parsed = JSON.parse(savedLogs);
            const hydrated = parsed.map((l: any) => ({...l, timestamp: new Date(l.timestamp)}));
            if (hydrated.length > 0) setLogs(hydrated);
        } catch(e) { console.error("Error cargando logs", e); }
    }
  }, []);

  // Guardar logs
  useEffect(() => {
    localStorage.setItem("zeus_logs", JSON.stringify(logs));
  }, [logs]);

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

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleReleaseClick = () => {
    const ordersToRelease =
      selectedIds.size > 0
        ? orders.filter((o) => selectedIds.has(o.id) && o.estatus === "pendiente")
        : orders.filter((o) => o.estatus === "pendiente");

    if (ordersToRelease.length === 0) {
      toast.warning("No hay órdenes pendientes para liberar.");
      return;
    }

    setShowConfirmDialog(true);
  };

  const executeRelease = async () => {
    setShowConfirmDialog(false);
    
    const ordersToRelease =
      selectedIds.size > 0
        ? orders.filter((o) => selectedIds.has(o.id) && o.estatus === "pendiente")
        : orders.filter((o) => o.estatus === "pendiente");

    setIsReleasing(true);
    addLog(`Iniciando liberación masiva en SAP...`, "info");

    for (const order of ordersToRelease) {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, estatus: "procesando" } : o));
      
      try {
        const response = await fetch('http://localhost:5000/liberar-orden', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_sap: order.producto, 
                producto: order.producto,
                lote: order.lote
            }),
        });

        const result = await response.json();

        if (result.success) {
            addLog(`OK: ${result.message}`, "success");
            setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, estatus: "liberado" } : o));
        } else {
            throw new Error(result.message);
        }

      } catch (error) {
        const msg = error instanceof Error ? error.message : "Error de conexión";
        addLog(`Fallo en orden ${order.lote}: ${msg}`, "error");
        setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, estatus: "error" } : o));
      }
      
      await delay(500); 
    }

    setIsReleasing(false);
    setSelectedIds(new Set());
    addLog("Ciclo de liberación finalizado.", "info");
    toast.success("Proceso finalizado");
  };

  const pendingCount = orders.filter((o) => o.estatus === "pendiente").length;
  const selectedPendingCount = Array.from(selectedIds).filter((id) => {
    const order = orders.find((o) => o.id === id);
    return order?.estatus === "pendiente";
  }).length;

  const releaseCount = selectedIds.size > 0 ? selectedPendingCount : pendingCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <DashboardMetrics orders={orders} logs={logs} />

      <ConfigurationCard
        releaseMode={releaseMode}
        onReleaseModeChange={setReleaseMode}
      />

      <OrdersGrid
        orders={orders}
        selectedIds={selectedIds}
        onOrdersChange={setOrders}
        onSelectionChange={setSelectedIds}
      />

      <ActivityLog logs={logs} />

      {/* Footer de Acciones */}
      <div className="flex items-center justify-between py-4 px-6 border border-[#FFB81C]/20 bg-white rounded-xl shadow-lg shadow-[#002855]/5 sticky bottom-4 z-10 backdrop-blur-md bg-white/90">
        <div className="text-sm text-[#002855]">
          {selectedIds.size > 0 ? (
            <span>
              <strong>{selectedIds.size}</strong> seleccionadas (
              <strong className="text-[#FFB81C]">{selectedPendingCount}</strong> pendientes)
            </span>
          ) : (
            <span>
              <strong>{pendingCount}</strong> pendientes de <strong>{orders.length}</strong>
            </span>
          )}
        </div>
        <Button
          size="lg"
          onClick={handleReleaseClick}
          disabled={isReleasing || releaseCount === 0 || !isConnected}
          className={`
            font-bold px-8 gap-2 shadow-md transition-all hover:scale-105
            ${isConnected 
              ? "bg-[#FFB81C] hover:bg-[#e5a50a] text-[#002855]" 
              : "bg-gray-300 cursor-not-allowed text-gray-500"}
          `}
        >
          {isReleasing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              {isConnected ? `LIBERAR (${releaseCount})` : "SAP NO DISPONIBLE"}
            </>
          )}
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="border-l-4 border-l-[#FFB81C]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-[#FFB81C] mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-bold uppercase tracking-wider text-xs">Confirmación de Seguridad</span>
            </div>
            <AlertDialogTitle className="text-[#002855]">
              ¿Confirmar liberación en SAP?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se enviarán <strong>{releaseCount} órdenes</strong> a la cola de procesamiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeRelease} className="bg-[#002855] text-white">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}