import { useState, useMemo, useEffect } from "react";
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
  Trash2, 
  Search, 
  Table as TableIcon, 
  Filter, 
  Download, 
  ArrowUpDown,
  Copy,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Order } from "@/types/orders";
import StatusBadge from "./StatusBadge";
import { toast } from "sonner";
import { CreateOrderDialog } from "./CreateOrderDialog";

interface OrdersGridProps {
  orders: Order[];
  selectedIds: Set<string>;
  onOrdersChange: (orders: Order[]) => void;
  onSelectionChange: (selectedIds: Set<string>) => void;
}

// Lista de Productos
const PRODUCT_OPTIONS = [
  "Corona", "Bud Light", "Corona Light Shine", "Pacifico", 
  "Modelo Especial", "Modelo Especial E", "Barrilito", "Victoria", 
  "Estrella E", "Pacifico E", "Negra Modelo", "Michelob Ultra", 
  "Busch Light", "Corona E", "Corona Light E", "BudWeiser", 
  "Pura Malta", "Corona Light SH E"
];

// Configuración de ordenamiento
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
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // --- PERSISTENCIA DE DATOS ---
  useEffect(() => {
    const savedOrders = localStorage.getItem("modelo_orders");
    if (savedOrders && orders.length === 0) {
      try {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
            onOrdersChange(parsed);
            toast.info("Sesión restaurada", { description: "Se han recuperado sus órdenes anteriores." });
        }
      } catch (e) {
        console.error("Error cargando persistencia", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("modelo_orders", JSON.stringify(orders));
  }, [orders]);

  // Lógica de Filtrado y Ordenamiento
  const processedOrders = useMemo(() => {
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

  const handleSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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
    toast.success("Reporte descargado correctamente");
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

  const updateOrder = (id: string, field: keyof Order, value: string) => {
    onOrdersChange(
      orders.map((order) =>
        order.id === id ? { ...order, [field]: value } : order
      )
    );
  };

  const deleteOrder = (id: string) => {
    const orderToDelete = orders.find(o => o.id === id);
    const newOrders = orders.filter(o => o.id !== id);
    onOrdersChange(newOrders);
    
    if (selectedIds.has(id)) {
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      onSelectionChange(newSelected);
    }

    toast.success("Orden eliminada", {
        description: `${orderToDelete?.producto} - ${orderToDelete?.lote}`,
    });
  };

  const duplicateOrder = (id: string) => {
    const orderToCopy = orders.find(o => o.id === id);
    if (orderToCopy) {
        const newOrder: Order = {
            ...orderToCopy,
            id: `ORD-${Date.now()}`,
            estatus: 'pendiente', 
            lote: `${orderToCopy.lote}-CPY`
        };
        onOrdersChange([...orders, newOrder]);
        toast.success("Orden duplicada", { description: "Se ha creado una copia para editar." });
    }
  };

  const clearAllOrders = () => {
    onOrdersChange([]);
    onSelectionChange(new Set());
    localStorage.removeItem("modelo_orders");
    toast.warning("Tabla limpiada completamente");
  };

  const isAllSelected =
    processedOrders.length > 0 &&
    processedOrders.every((o) => selectedIds.has(o.id));
  
  // Ajusté el input para que se vea bien sobre fondos de color (bg-transparent)
  const inputClassName = 
    "h-8 text-sm bg-transparent border-transparent hover:bg-white/50 focus:bg-white focus:border-[#FFB81C] focus:ring-[#FFB81C]/20 transition-all font-medium text-[#002855]";

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

              <CreateOrderDialog 
                onCreate={(newOrder) => onOrdersChange([...orders, newOrder])} 
              />

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
                <TooltipContent>Borrar TODA la tabla</TooltipContent>
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
                <SortableHead label="Producto" field="producto" className="min-w-[100px]" />
                <SortableHead label="Descripción" field="descripcion" className="min-w-[180px]" />
                <SortableHead label="Lote" field="lote" className="min-w-[100px]" />
                <SortableHead label="Prehop" field="prehop" className="min-w-[80px]" />
                <SortableHead label="Desc Order" field="descOrder" className="min-w-[100px]" />
                <SortableHead label="Casa" field="casa" className="min-w-[80px]" />
                <SortableHead label="Línea" field="linea" className="min-w-[80px]" />
                <SortableHead label="Batería" field="bateria" className="min-w-[80px]" />
                <SortableHead label="Estatus" field="estatus" className="min-w-[100px]" />
                <TableHead className="text-white font-bold text-center w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                        <Search className="h-6 w-6 text-blue-200" />
                      </div>
                      <p>
                        {orders.length === 0
                          ? 'No hay órdenes.'
                          : "No se encontraron resultados."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                processedOrders.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className={`
                      transition-colors duration-200 border-b border-blue-200
                      ${selectedIds.has(order.id) 
                        ? "bg-[#FFB81C]/30 hover:bg-[#FFB81C]/40"  // Seleccionada: Dorado Intenso
                        : index % 2 === 1 
                            ? "bg-blue-100 hover:bg-blue-200"     // Impar: Azul Visible
                            : "bg-gray-100 hover:bg-gray-200"}    // Par: Gris Claro
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
                        onChange={(e) => updateOrder(order.id, "producto", e.target.value)}
                        className={inputClassName}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.descripcion}
                        onValueChange={(value) => updateOrder(order.id, "descripcion", value)}
                      >
                        <SelectTrigger className={`${inputClassName} w-full text-left`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {PRODUCT_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.lote}
                        onChange={(e) => updateOrder(order.id, "lote", e.target.value)}
                        className={inputClassName}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.prehop}
                        onChange={(e) => updateOrder(order.id, "prehop", e.target.value)}
                        className={inputClassName}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.descOrder}
                        onChange={(e) => updateOrder(order.id, "descOrder", e.target.value)}
                        className={inputClassName}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.casa}
                        onChange={(e) => updateOrder(order.id, "casa", e.target.value)}
                        className={inputClassName}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.linea}
                        onChange={(e) => updateOrder(order.id, "linea", e.target.value)}
                        className={inputClassName}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.bateria}
                        onChange={(e) => updateOrder(order.id, "bateria", e.target.value)}
                        className={inputClassName}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.estatus} />
                    </TableCell>
                    
                    <TableCell className="text-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-black/10">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4 text-[#002855]" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => duplicateOrder(order.id)} className="cursor-pointer">
                                    <Copy className="mr-2 h-4 w-4" /> Duplicar Fila
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => deleteOrder(order.id)} 
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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