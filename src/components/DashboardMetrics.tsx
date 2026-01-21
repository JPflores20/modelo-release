import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Order } from "@/types/orders";

interface DashboardMetricsProps {
  orders: Order[];
}

const DashboardMetrics = ({ orders }: DashboardMetricsProps) => {
  // Cálculos en tiempo real
  const total = orders.length;
  const pendientes = orders.filter((o) => o.estatus === "pendiente").length;
  const liberadas = orders.filter((o) => o.estatus === "liberado").length;
  const errores = orders.filter((o) => o.estatus === "error").length;

  // Porcentaje de avance
  const avance = total > 0 ? Math.round((liberadas / total) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-bottom-4 duration-500">
      {/* Total y Avance */}
      <Card className="border-l-4 border-l-[#002855] shadow-md bg-white hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avance del Turno
          </CardTitle>
          <Activity className="h-4 w-4 text-[#002855]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#002855]">{avance}%</div>
          <p className="text-xs text-muted-foreground">
            {liberadas} de {total} órdenes procesadas
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
  );
};

export default DashboardMetrics;