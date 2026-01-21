import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Plus, 
  Trash2, 
  Search, 
  Table as TableIcon, 
  Filter, 
  Download, 
  ArrowUpDown 
} from "lucide-react";
import { Order } from "@/types/orders";
import StatusBadge from "./StatusBadge";
import { toast } from "sonner"; // Usamos sonner para notificar la descarga

interface OrdersGridProps {
  orders: Order[];
  selectedIds: Set<string>;
  onOrdersChange: (orders: Order[]) => void;
  onSelectionChange: (selectedIds: Set<string>) => void;
}

// Lista de Productos
const PRODUCT_OPTIONS = [
  "Corona",
  "Bud Light",
  "Corona Light Shine",
  "Pacifico",
  "Modelo Especial",
  "Modelo Especial E",
  "Barrilito",
  "Victoria",
  "Estrella E",
  "Pacifico E",
  "Negra Modelo",
  "Michelob Ultra",
  "Busch Light",
  "Corona E",
  "Corona Light E",
  "BudWeiser",
  "Pura Malta",
  "Corona Light SH E"
];

// Tipo para la configuración de ordenamiento
type SortConfig = {
  key: keyof Order;
  direction: 'asc' | 'desc';
} | null;

const OrdersGrid = ({
  orders,
  selectedIds,
  onOrdersChange,
  onSelectionChange,
}: OrdersGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null); // Estado para ordenar

  // Lógica de Filtrado y Ordenamiento
  const processedOrders = useMemo(() => {
    // 1. Filtrado
    let result = orders.filter((order) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        !term || 
        order.producto.toLowerCase().includes(term) ||
        order.descripcion.toLowerCase().includes(term) ||
        order.lote.toLowerCase().includes(term) ||
        order.casa.toLowerCase().includes(term) ||
        order.linea.toLowerCase().includes(term) ||
        order.bateria.toLowerCase().includes(term);

      const matchesStatus = 
        statusFilter === "all" || 
        order.estatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // 2. Ordenamiento
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [orders, searchTerm, statusFilter, sortConfig]);

  // Manejador de clic en encabezados para ordenar
  const handleSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función para exportar a CSV
  const handleExportCSV = () => {
    if (processedOrders.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const headers = ["ID,Producto,Descripción,Lote,Prehop,DescOrder,Casa,Línea,Batería,Estatus"];
    const rows = processedOrders.map(o => 
      `${o.id},${o.producto},${o.descripcion},${o.lote},${o.prehop},${o.descOrder},${o.casa},${o.linea},${o.bateria},${o.estatus}`
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ordenes_produccion_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Archivo CSV descargado correctamente");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(processedOrders.map((o) => o.id));
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    onSelectionChange(newSelection);
  };

  const addNewOrder = () => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      producto: "",
      descripcion: "",
      lote: "",
      prehop: "",
      descOrder: "",
      casa: "",
      linea: "",
      bateria: "",
      estatus: "pendiente",
    };
    onOrdersChange([...orders, newOrder]);
  };

  const updateOrder = (id: string, field: keyof Order, value: string) => {
    onOrdersChange(
      orders.map((order) =>
        order.id === id ? { ...order, [field]: value } : order
      )
    );
  };

  const clearAllOrders = () => {
    onOrdersChange([]);
    onSelectionChange(new Set());
  };

  const isAllSelected =
    processedOrders.length > 0 &&
    processedOrders.every((o) => selectedIds.has(o.id));
  
  const inputClassName = 
    "h-8 text-sm bg-white border-blue-100 focus:border-[#FFB81C] focus:ring-[#FFB81C]/20 transition-all font-medium text-[#002855]";

  // Componente auxiliar para encabezados ordenables
  const SortableHead = ({ label, field, className = "" }: { label: string, field: keyof Order, className?: string }) => (
    <TableHead 
      className={`text-white font-bold cursor-pointer hover:bg-[#001f40] transition-colors group select-none ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3 w-3 transition-opacity ${sortConfig?.key === field ? "opacity-100 text-[#FFB81C]" : "opacity-30 group-hover:opacity-70"}`} />
      </div>
    </TableHead>
  );

  return (
    <Card className="border shadow-2xl flex-1 overflow-hidden bg-white/90 backdrop-blur-sm border-[#002855]/10">
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#002855]/10 rounded-lg">
              <TableIcon className="h-5 w-5 text-[#002855]" />
            </div>
            <div>
              <CardTitle className="text-lg text-[#002855] font-bold">Órdenes de Producción</CardTitle>
              <p className="text-xs text-muted-foreground">Gestión de lotes y consumos</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            
            {/* Filtro por Estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px] h-9 border-blue-100 bg-white">
                <Filter className="w-3 h-3 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="procesando">Procesando</SelectItem>
                <SelectItem value="liberado">Liberados</SelectItem>
                <SelectItem value="error">Errores</SelectItem>
              </SelectContent>
            </Select>

            {/* Búsqueda */}
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#FFB81C] transition-colors" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-48 border-blue-100 focus:border-[#FFB81C] focus:ring-[#FFB81C]/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Botón Exportar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    className="gap-1 border-green-200 hover:border-green-600 hover:text-green-700 hover:bg-green-50 flex-1 sm:flex-none"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline font-semibold">Exportar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Descargar CSV</TooltipContent>
              </Tooltip>

              {/* Botón Agregar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addNewOrder}
                    className="gap-1 border-blue-200 hover:border-[#002855] hover:text-[#002855] hover:bg-blue-50 flex-1 sm:flex-none"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline font-semibold">Agregar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Agregar nueva fila</TooltipContent>
              </Tooltip>

              {/* Botón Limpiar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllOrders}
                    className="gap-1 text-destructive border-red-100 hover:bg-red-50 flex-1 sm:flex-none"
                    disabled={orders.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Limpiar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Limpiar tabla</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#002855] border-b-4 border-[#FFB81C]">
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-white/50 data-[state=checked]:bg-[#FFB81C] data-[state=checked]:text-[#002855] data-[state=checked]:border-[#FFB81C]"
                  />
                </TableHead>
                {/* Encabezados Ordenables */}
                <SortableHead label="Producto" field="producto" className="min-w-[100px]" />
                <SortableHead label="Descripción" field="descripcion" className="min-w-[180px]" />
                <SortableHead label="Lote" field="lote" className="min-w-[100px]" />
                <SortableHead label="Prehop" field="prehop" className="min-w-[80px]" />
                <SortableHead label="Desc Order" field="descOrder" className="min-w-[100px]" />
                <SortableHead label="Casa" field="casa" className="min-w-[80px]" />
                <SortableHead label="Línea" field="linea" className="min-w-[80px]" />
                <SortableHead label="Batería" field="bateria" className="min-w-[80px]" />
                <SortableHead label="Estatus" field="estatus" className="min-w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <Search className="h-6 w-6 text-blue-200" />
                      </div>
                      <p>
                        {orders.length === 0
                          ? 'No hay órdenes.'
                          : "No se encontraron resultados para los filtros actuales."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                processedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={`
                      transition-colors duration-200 border-b border-blue-100/50
                      ${selectedIds.has(order.id) 
                        ? "bg-[#FFB81C]/10 hover:bg-[#FFB81C]/20" 
                        : "hover:bg-blue-50/50"}
                    `}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(order.id, checked as boolean)
                        }
                        className="data-[state=checked]:bg-[#002855] data-[state=checked]:border-[#002855]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.producto}
                        onChange={(e) =>
                          updateOrder(order.id, "producto", e.target.value)
                        }
                        className={inputClassName}
                        placeholder="ID"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.descripcion}
                        onValueChange={(value) =>
                          updateOrder(order.id, "descripcion", value)
                        }
                      >
                        <SelectTrigger className={`${inputClassName} w-full text-left`}>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {PRODUCT_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.lote}
                        onChange={(e) =>
                          updateOrder(order.id, "lote", e.target.value)
                        }
                        className={inputClassName}
                        placeholder="Lote"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.prehop}
                        onChange={(e) =>
                          updateOrder(order.id, "prehop", e.target.value)
                        }
                        className={inputClassName}
                        placeholder="Prehop"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.descOrder}
                        onChange={(e) =>
                          updateOrder(order.id, "descOrder", e.target.value)
                        }
                        className={inputClassName}
                        placeholder="Desc"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.casa}
                        onChange={(e) =>
                          updateOrder(order.id, "casa", e.target.value)
                        }
                        className={inputClassName}
                        placeholder="Casa"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.linea}
                        onChange={(e) =>
                          updateOrder(order.id, "linea", e.target.value)
                        }
                        className={inputClassName}
                        placeholder="Línea"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.bateria}
                        onChange={(e) =>
                          updateOrder(order.id, "bateria", e.target.value)
                        }
                        className={inputClassName}
                        placeholder="Batería"
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.estatus} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersGrid;