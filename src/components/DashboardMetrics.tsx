import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Order } from "@/types/orders";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DashboardMetricsProps {
  orders: Order[];
}

const DashboardMetrics = ({ orders }: DashboardMetricsProps) => {
  const [isChartOpen, setIsChartOpen] = useState(false);

  // Cálculos en tiempo real
  const total = orders.length;
  const pendientes = orders.filter((o) => o.estatus === "pendiente").length;
  const liberadas = orders.filter((o) => o.estatus === "liberado").length;
  const errores = orders.filter((o) => o.estatus === "error").length;
  // Calculamos otros (por ejemplo, 'procesando') si la suma no cuadra, o asumimos que son estos 3 estados clave
  const otros = total - (pendientes + liberadas + errores);

  // Porcentaje de avance
  const avance = total > 0 ? Math.round((liberadas / total) * 100) : 0;

  // Datos para el gráfico
  const chartData = [
    { name: "Liberadas", value: liberadas, color: "#10b981" }, // emerald-500
    { name: "Pendientes", value: pendientes, color: "#FFB81C" }, // Brand Gold
    { name: "Errores", value: errores, color: "#ef4444" }, // red-500
    ...(otros > 0 ? [{ name: "Procesando/Otros", value: otros, color: "#64748b" }] : []),
  ].filter(item => item.value > 0);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom-4 duration-500">
        {/* Total y Avance - AHORA CLICABLE */}
        <Card 
          onClick={() => setIsChartOpen(true)}
          className="border-l-4 border-l-[#002855] shadow-md bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
        >
          {/* Efecto visual de 'clicable' */}
          <div className="absolute inset-0 bg-[#002855]/0 group-hover:bg-[#002855]/5 transition-colors" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-[#002855] transition-colors">
              Avance del Turno
            </CardTitle>
            <Activity className="h-4 w-4 text-[#002855]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#002855]">{avance}%</div>
            <p className="text-xs text-muted-foreground">
              {liberadas} de {total} órdenes procesadas
            </p>
            <p className="text-[10px] text-[#002855]/60 mt-2 font-medium">
              Click para ver gráfico
            </p>
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card className="border-l-4 border-l-[#FFB81C] shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-[#FFB81C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#002855]">{pendientes}</div>
            <p className="text-xs text-muted-foreground">
              Requieren liberación
            </p>
          </CardContent>
        </Card>

        {/* Liberadas Exitosas */}
        <Card className="border-l-4 border-l-emerald-500 shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Liberadas OK
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#002855]">{liberadas}</div>
            <p className="text-xs text-muted-foreground">
              Sincronizadas con SAP
            </p>
          </CardContent>
        </Card>

        {/* Errores */}
        <Card className={`border-l-4 shadow-md bg-white hover:shadow-lg transition-shadow ${errores > 0 ? "border-l-red-500 bg-red-50" : "border-l-gray-200"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas / Errores
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${errores > 0 ? "text-red-500" : "text-gray-400"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${errores > 0 ? "text-red-600" : "text-[#002855]"}`}>
              {errores}
            </div>
            <p className="text-xs text-muted-foreground">
              Fallos de conexión RFC
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal con Gráfico */}
      <Dialog open={isChartOpen} onOpenChange={setIsChartOpen}>
        <DialogContent className="sm:max-w-md border-t-4 border-t-[#002855]">
          <DialogHeader>
            <DialogTitle className="text-[#002855] text-xl flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Desglose de Producción
            </DialogTitle>
            <DialogDescription>
              Visualización en tiempo real del estado de las órdenes del turno actual.
            </DialogDescription>
          </DialogHeader>

          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} Órdenes`, 'Cantidad']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#002855', fontWeight: 600 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Resumen numérico rápido en el pie del modal */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 pt-4 border-t">
            <div>
              <span className="block font-bold text-[#10b981]">{liberadas}</span>
              <span className="text-muted-foreground">Liberadas</span>
            </div>
            <div>
              <span className="block font-bold text-[#FFB81C]">{pendientes}</span>
              <span className="text-muted-foreground">Pendientes</span>
            </div>
            <div>
              <span className="block font-bold text-[#ef4444]">{errores}</span>
              <span className="text-muted-foreground">Errores</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardMetrics;