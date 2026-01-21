import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, HelpCircle } from "lucide-react";
import { ReleaseMode } from "@/types/orders";

interface ConfigurationCardProps {
  releaseMode: ReleaseMode;
  onReleaseModeChange: (mode: ReleaseMode) => void;
}

const ConfigurationCard = ({
  releaseMode,
  onReleaseModeChange,
}: ConfigurationCardProps) => {
  const handleToggle = (checked: boolean) => {
    onReleaseModeChange(checked ? "consecutivos" : "identicos");
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Configuración de Liberación</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Determina la lógica de agrupación para el envío a SAP. 
                <strong> Lotes Idénticos</strong> agrupa órdenes con el mismo número de lote.
                <strong> Lotes Consecutivos</strong> agrupa órdenes con lotes en secuencia numérica.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
            <Label className="text-base font-medium">Modo de Liberación:</Label>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  releaseMode === "identicos"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                Lotes Idénticos
              </span>
              <Switch
                checked={releaseMode === "consecutivos"}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-secondary"
              />
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  releaseMode === "consecutivos"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                Lotes Consecutivos
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationCard;
