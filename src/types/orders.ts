export type OrderStatus = "pendiente" | "procesando" | "liberado" | "error";

export interface Order {
  id: string;
  producto: string;
  descripcion: string;
  lote: string;
  prehop: string;
  descOrder: string;
  casa: string;
  linea: string;
  bateria: string;
  estatus: OrderStatus;
}

export type ReleaseMode = "identicos" | "consecutivos";

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: "info" | "success" | "error" | "warning";
}
