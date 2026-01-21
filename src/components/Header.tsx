import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Server, User, LogOut } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
}

const Header = ({ isConnected }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
              <img
                src="/placeholder.svg"
                alt="Grupo Modelo Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-primary-foreground/70">Grupo Modelo</p>
            </div>
          </div>

          {/* Center: Title */}
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold">
              Sistema de Liberación de Órdenes
            </h1>
            <p className="text-xs sm:text-sm text-primary-foreground/80">
              Control de Consumos de Mosto
            </p>
          </div>

          {/* Right: Status and User */}
          <div className="flex items-center gap-4">
            {/* SAP Connection Status */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 rounded-full">
                  <Server className="h-4 w-4" />
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isConnected ? "bg-green-400 animate-pulse-slow" : "bg-red-400"
                    }`}
                  />
                  <span className="hidden md:inline text-sm">
                    {isConnected ? "SAP Conectado" : "SAP Desconectado"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Estado de conexión con SAP RFC</p>
              </TooltipContent>
            </Tooltip>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 rounded-full">
                <User className="h-4 w-4" />
                <span className="text-sm capitalize">{user?.username}</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cerrar Sesión</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
