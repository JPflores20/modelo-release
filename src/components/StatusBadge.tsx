import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types/orders";

interface StatusBadgeProps {
  status: OrderStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "pendiente":
        return {
          label: "Pendiente",
          className: "bg-muted text-muted-foreground hover:bg-muted",
        };
      case "procesando":
        return {
          label: "Procesando",
          className: "bg-info text-info-foreground hover:bg-info",
        };
      case "liberado":
        return {
          label: "Liberado",
          className: "bg-success text-success-foreground hover:bg-success",
        };
      case "error":
        return {
          label: "Error",
          className: "bg-destructive text-destructive-foreground hover:bg-destructive",
        };
      default:
        return {
          label: status,
          className: "bg-muted text-muted-foreground hover:bg-muted",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={`${config.className} font-medium`}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
