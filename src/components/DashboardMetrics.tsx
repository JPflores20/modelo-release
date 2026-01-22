import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle, Clock, AlertTriangle, XCircle, Info } from "lucide-react";
import { Order, LogEntry } from "@/types/orders";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DashboardMetricsProps {
  orders: Order[];
  logs: LogEntry[];
}

const DashboardMetrics = ({ orders, logs }: DashboardMetricsProps) => {
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isErrorHistoryOpen, setIsErrorHistoryOpen] = useState(false);

  const total = orders.length;
  const pendientes = orders.filter((o) => o.estatus === "pendiente").length;
  const liberadas = orders.filter((o) => o.estatus === "liberado").length;
  const errores = orders.filter((o) => o.estatus === "error").length;
  const otros = total - (pendientes + liberadas + errores);

  const avance = total > 0 ? Math.round((liberadas / total) * 100) : 0;

  const chartData = [
    { name: "Liberadas", value: liberadas, color: "#10b981" },
    { name: "Pendientes", value: pendientes, color: "#FFB81C" },
    { name: "Errores", value: errores, color: "#ef4444" },
    ...(otros > 0 ? [{ name: "Procesando/Otros", value: otros, color: "#64748b" }] : []),
  ].filter(item => item.value > 0);

  // Filtramos logs de error
  const errorLogs = logs.filter(log => log.type === 'error').sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom-4 duration-500">
        {/* Total y Avance */}
        <Card 
          onClick={() => setIsChartOpen(true)}
          className="border-l-4 border-l-[#002855] shadow-md bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#002855]/0 group-hover:bg-[#002855]/5 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-[#002855] transition-colors">
              Avance del Turno
            </CardTitle>
            <Activity className="h-4 w-4 text-[#002855]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#002855]">{avance}%</div>
            <p className="text-xs text-muted-foreground">{liberadas} de {total} órdenes procesadas</p>
            <p className="text-[10px] text-[#002855]/60 mt-2 font-medium">Click para ver gráfico</p>
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card className="border-l-4 border-l-[#FFB81C] shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-[#FFB81C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#002855]">{pendientes}</div>
            <p className="text-xs text-muted-foreground">Requieren liberación</p>
          </CardContent>
        </Card>

        {/* Liberadas Exitosas */}
        <Card className="border-l-4 border-l-emerald-500 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Liberadas OK</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#002855]">{liberadas}</div>
            <p className="text-xs text-muted-foreground">Sincronizadas con SAP</p>
          </CardContent>
        </Card>

        {/* Errores - CORREGIDO: Abre si hay errores O logs */}
        <Card 
          onClick={() => (errores > 0 || errorLogs.length > 0) && setIsErrorHistoryOpen(true)}
          className={`border-l-4 shadow-md bg-white transition-all relative overflow-hidden 
            ${errores > 0 ? "border-l-red-500 hover:shadow-xl hover:scale-[1.02] cursor-pointer group" : "border-l-gray-200"}
          `}
        >
          {errores > 0 && <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors" />}
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${errores > 0 ? "text-red-600 group-hover:text-red-700" : "text-muted-foreground"}`}>
              Alertas / Errores
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${errores > 0 ? "text-red-500" : "text-gray-400"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${errores > 0 ? "text-red-600" : "text-[#002855]"}`}>
              {errores}
            </div>
            <p className="text-xs text-muted-foreground">Fallos de conexión RFC</p>
            {errores > 0 && (
              <p className="text-[10px] text-red-600/60 mt-2 font-medium animate-pulse">
                Click para ver historial
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Gráfico */}
      <Dialog open={isChartOpen} onOpenChange={setIsChartOpen}>
        <DialogContent className="sm:max-w-md border-t-4 border-t-[#002855]">
          <DialogHeader>
            <DialogTitle className="text-[#002855] text-xl flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Desglose de Producción
            </DialogTitle>
            <DialogDescription>
              Visualización en tiempo real del estado de las órdenes.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} Órdenes`, 'Cantidad']} contentStyle={{ borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Historial de Errores */}
      <Dialog open={isErrorHistoryOpen} onOpenChange={setIsErrorHistoryOpen}>
        <DialogContent className="sm:max-w-[600px] border-t-4 border-t-red-500">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Historial de Errores
            </DialogTitle>
            <DialogDescription>
              Registro detallado de fallos reportados por SAP o el sistema.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] w-full rounded-md border border-red-100 bg-red-50/30 p-4">
            {errorLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 text-center">
                {errores > 0 ? (
                    <>
                        <div className="bg-red-100 p-3 rounded-full">
                            <Info className="h-8 w-8 text-red-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-red-700">Hay {errores} órdenes con error</p>
                            <p className="text-sm max-w-xs mx-auto mt-1">
                                Sin embargo, el historial detallado se ha limpiado (posiblemente por una recarga de página).
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <CheckCircle className="h-10 w-10 text-green-500/50" />
                        <p>No hay errores registrados.</p>
                    </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {errorLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 items-start bg-white p-3 rounded-lg shadow-sm border border-red-100">
                    <div className="bg-red-100 p-2 rounded-full mt-0.5">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-red-800 uppercase tracking-wide">
                          Error de Proceso
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardMetrics;