import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { LogEntry } from "@/types/orders";

interface ActivityLogProps {
  logs: LogEntry[];
}

const ActivityLog = ({ logs }: ActivityLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-3.5 w-3.5 text-success" />;
      case "error":
        return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-3.5 w-3.5 text-warning" />;
      default:
        return <Info className="h-3.5 w-3.5 text-info" />;
    }
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-success";
      case "error":
        return "text-destructive";
      case "warning":
        return "text-warning";
      default:
        return "text-info";
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Log de Ejecución</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={scrollRef}
          className="bg-foreground/95 text-primary-foreground rounded-b-lg h-48 overflow-y-auto scrollbar-thin font-mono text-xs p-4"
        >
          {logs.length === 0 ? (
            <div className="text-muted-foreground/70 flex items-center gap-2">
              <span className="animate-pulse">▌</span>
              Esperando actividad...
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-muted-foreground/70 flex-shrink-0">
                    [{formatTime(log.timestamp)}]
                  </span>
                  {getLogIcon(log.type)}
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))}
              <div className="text-muted-foreground/70 flex items-center gap-2">
                <span className="animate-pulse">▌</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
