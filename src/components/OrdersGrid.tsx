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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2, Search, Table as TableIcon } from "lucide-react";
import { Order } from "@/types/orders";
import StatusBadge from "./StatusBadge";

interface OrdersGridProps {
  orders: Order[];
  selectedIds: Set<string>;
  onOrdersChange: (orders: Order[]) => void;
  onSelectionChange: (selectedIds: Set<string>) => void;
}

const OrdersGrid = ({
  orders,
  selectedIds,
  onOrdersChange,
  onSelectionChange,
}: OrdersGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders;
    const term = searchTerm.toLowerCase();
    return orders.filter(
      (order) =>
        order.producto.toLowerCase().includes(term) ||
        order.descripcion.toLowerCase().includes(term) ||
        order.lote.toLowerCase().includes(term) ||
        order.casa.toLowerCase().includes(term) ||
        order.linea.toLowerCase().includes(term) ||
        order.bateria.toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

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
  const isPartialSelected =
    filteredOrders.some((o) => selectedIds.has(o.id)) && !isAllSelected;

  return (
    <Card className="border-2 flex-1">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Órdenes de Producción</CardTitle>
            <span className="text-sm text-muted-foreground">
              ({orders.length} registros)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            {/* Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewOrder}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Agregar</span>
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
                  className="gap-1 text-destructive hover:text-destructive"
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
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className={isPartialSelected ? "data-[state=checked]:bg-primary/50" : ""}
                  />
                </TableHead>
                <TableHead className="min-w-[100px]">Producto</TableHead>
                <TableHead className="min-w-[150px]">Descripción</TableHead>
                <TableHead className="min-w-[100px]">Lote</TableHead>
                <TableHead className="min-w-[80px]">Prehop</TableHead>
                <TableHead className="min-w-[100px]">Desc Order</TableHead>
                <TableHead className="min-w-[80px]">Casa</TableHead>
                <TableHead className="min-w-[80px]">Línea</TableHead>
                <TableHead className="min-w-[80px]">Batería</TableHead>
                <TableHead className="min-w-[100px]">Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {orders.length === 0
                        ? 'No hay órdenes. Haga clic en "Agregar" para comenzar.'
                        : "No se encontraron resultados para la búsqueda."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={
                      selectedIds.has(order.id)
                        ? "bg-primary/5"
                        : "hover:bg-muted/30"
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(order.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.producto}
                        onChange={(e) =>
                          updateOrder(order.id, "producto", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="ID"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.descripcion}
                        onChange={(e) =>
                          updateOrder(order.id, "descripcion", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="Descripción"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.lote}
                        onChange={(e) =>
                          updateOrder(order.id, "lote", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="Lote"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.prehop}
                        onChange={(e) =>
                          updateOrder(order.id, "prehop", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="Prehop"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.descOrder}
                        onChange={(e) =>
                          updateOrder(order.id, "descOrder", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="Desc"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.casa}
                        onChange={(e) =>
                          updateOrder(order.id, "casa", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="Casa"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.linea}
                        onChange={(e) =>
                          updateOrder(order.id, "linea", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="Línea"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={order.bateria}
                        onChange={(e) =>
                          updateOrder(order.id, "bateria", e.target.value)
                        }
                        className="h-8 text-sm"
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
