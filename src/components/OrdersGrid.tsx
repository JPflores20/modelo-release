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
import { Plus, Trash2, Search, Table as TableIcon, Filter } from "lucide-react";
import { Order } from "@/types/orders";
import StatusBadge from "./StatusBadge";

interface OrdersGridProps {
  orders: Order[];
  selectedIds: Set<string>;
  onOrdersChange: (orders: Order[]) => void;
  onSelectionChange: (selectedIds: Set<string>) => void;
}

// Lista de Productos (Tu lista personalizada)
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

const OrdersGrid = ({
  orders,
  selectedIds,
  onOrdersChange,
  onSelectionChange,
}: OrdersGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // NUEVO: Estado para el filtro

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Filtro por Texto
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        !term || 
        order.producto.toLowerCase().includes(term) ||
        order.descripcion.toLowerCase().includes(term) ||
        order.lote.toLowerCase().includes(term) ||
        order.casa.toLowerCase().includes(term) ||
        order.linea.toLowerCase().includes(term) ||
        order.bateria.toLowerCase().includes(term);

      // 2. Filtro por Estado (NUEVO)
      const matchesStatus = 
        statusFilter === "all" || 
        order.estatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredOrders.map((o) => o.id));
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
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedIds.has(o.id));
  
  const inputClassName = 
    "h-8 text-sm bg-white border-blue-100 focus:border-[#FFB81C] focus:ring-[#FFB81C]/20 transition-all font-medium text-[#002855]";

  return (
    <Card className="border shadow-2xl flex-1 overflow-hidden bg-white/90 backdrop-blur-sm border-[#002855]/10">
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#002855]/10 rounded-lg">
              <TableIcon className="h-5 w-5 text-[#002855]" />
            </div>
            <div>
              <CardTitle className="text-lg text-[#002855] font-bold">Órdenes de Producción</CardTitle>
              <p className="text-xs text-muted-foreground">Gestión de lotes y consumos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            
            {/* NUEVO: Filtro por Estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 border-blue-100 bg-white">
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
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#FFB81C] transition-colors" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-32 sm:w-48 border-blue-100 focus:border-[#FFB81C] focus:ring-[#FFB81C]/20"
              />
            </div>

            {/* Acciones */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewOrder}
                  className="gap-1 border-blue-200 hover:border-[#002855] hover:text-[#002855] hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline font-semibold">Agregar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agregar nueva fila</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllOrders}
                  className="gap-1 text-destructive border-red-100 hover:bg-red-50"
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
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#002855] hover:bg-[#002855] border-b-4 border-[#FFB81C]">
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="border-white/50 data-[state=checked]:bg-[#FFB81C] data-[state=checked]:text-[#002855] data-[state=checked]:border-[#FFB81C]"
                  />
                </TableHead>
                <TableHead className="min-w-[100px] text-white font-bold">Producto</TableHead>
                <TableHead className="min-w-[180px] text-white font-bold">Descripción</TableHead>
                <TableHead className="min-w-[100px] text-white font-bold">Lote</TableHead>
                <TableHead className="min-w-[80px] text-white font-bold">Prehop</TableHead>
                <TableHead className="min-w-[100px] text-white font-bold">Desc Order</TableHead>
                <TableHead className="min-w-[80px] text-white font-bold">Casa</TableHead>
                <TableHead className="min-w-[80px] text-white font-bold">Línea</TableHead>
                <TableHead className="min-w-[80px] text-white font-bold">Batería</TableHead>
                <TableHead className="min-w-[100px] text-white font-bold">Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
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
                filteredOrders.map((order) => (
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