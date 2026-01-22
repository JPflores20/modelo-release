import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
import { Order } from "@/types/orders";
import { toast } from "sonner";

// Esquema de validación estricto
const orderSchema = z.object({
  producto: z.string().min(1, "El ID de producto es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  lote: z.string().min(1, "El lote es requerido"),
  prehop: z.string().min(1, "El campo Prehop es requerido"),
  descOrder: z.string().min(1, "Desc Order es requerido"),
  casa: z.string().min(1, "Casa es requerida"),
  linea: z.string().min(1, "Línea es requerida"),
  bateria: z.string().min(1, "Batería es requerida"),
});

// Lista de Productos Oficial
const PRODUCT_OPTIONS = [
  "Corona", "Bud Light", "Corona Light Shine", "Pacifico", 
  "Modelo Especial", "Modelo Especial E", "Barrilito", "Victoria", 
  "Estrella E", "Pacifico E", "Negra Modelo", "Michelob Ultra", 
  "Busch Light", "Corona E", "Corona Light E", "BudWeiser", 
  "Pura Malta", "Corona Light SH E"
];

interface CreateOrderDialogProps {
  onCreate: (newOrder: Order) => void;
}

export function CreateOrderDialog({ onCreate }: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      producto: "",
      descripcion: "",
      lote: "",
      prehop: "",
      descOrder: "",
      casa: "",
      linea: "",
      bateria: "",
    },
  });

  const onSubmit = (values: z.infer<typeof orderSchema>) => {
    // CORRECCIÓN: Usamos 'as Order' para asegurar a TypeScript que el objeto cumple con la interfaz.
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      ...values,
      estatus: "pendiente",
    } as Order;

    onCreate(newOrder);
    
    toast.success("Orden creada exitosamente", {
      description: `Lote: ${values.lote} - ${values.descripcion}`
    });
    
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-2 bg-[#002855] text-white hover:bg-[#001f40] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-900/30 border-2 border-transparent hover:border-[#FFB81C] font-bold px-6 flex-1 sm:flex-none transform"
        >
          <Plus className="h-5 w-5 text-[#FFB81C]" />
          <span className="inline">Crear Nueva Orden</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] border-t-4 border-t-[#FFB81C] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#002855] text-xl flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#FFB81C]" />
            Nueva Orden de Producción
          </DialogTitle>
          <DialogDescription>
            Capture los datos del reporte "Consumos de Mosto".
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Producto ID */}
              <FormField
                control={form.control}
                name="producto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#002855] font-semibold">Producto (ID)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. CORO-001" {...field} className="border-blue-200 focus:border-[#FFB81C]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descripción (Select) */}
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#002855] font-semibold">Descripción</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-blue-200 focus:border-[#FFB81C]">
                          <SelectValue placeholder="Seleccionar producto..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {PRODUCT_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lote */}
              <FormField
                control={form.control}
                name="lote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#002855] font-semibold">Lote</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. L2024-00X" {...field} className="border-blue-200 focus:border-[#FFB81C]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Desc Order */}
              <FormField
                control={form.control}
                name="descOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#002855] font-semibold">Desc Order</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. DO-1234" {...field} className="border-blue-200 focus:border-[#FFB81C]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prehop */}
              <FormField
                control={form.control}
                name="prehop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#002855] font-semibold">Prehop</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. PH-01" {...field} className="border-blue-200 focus:border-[#FFB81C]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Casa */}
              <FormField
                control={form.control}
                name="casa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#002855] font-semibold">Casa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. PLT-01" {...field} className="border-blue-200 focus:border-[#FFB81C]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Linea */}
              <FormField
                control={form.control}
                name="linea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#002855] font-semibold">Línea</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. L-01" {...field} className="border-blue-200 focus:border-[#FFB81C]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bateria */}
              <FormField
                control={form.control}
                name="bateria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#002855] font-semibold">Batería</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. B-001" {...field} className="border-blue-200 focus:border-[#FFB81C]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 border-t mt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#002855] hover:bg-[#001f40] text-white gap-2 shadow-md hover:scale-105 transition-transform">
                <Save className="h-4 w-4 text-[#FFB81C]" />
                Guardar Orden
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}