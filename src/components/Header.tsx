import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Server, LogOut, Beer } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
}

const Header = ({ isConnected }: HeaderProps) => {
  // --- LÓGICA ORIGINAL ---
  const { user, logout } = useAuth();
  // -----------------------

  return (
    <header className="bg-[#002855] text-white shadow-2xl border-b-4 border-[#FFB81C] relative z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Izquierda: Branding Grupo Modelo */}
          <div className="flex items-center gap-3 md:gap-4 transition-opacity hover:opacity-90">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-black/10">
               <Beer className="w-6 h-6 md:w-8 md:h-8 text-[#FFB81C] fill-[#FFB81C]/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold tracking-tight leading-none text-white">
                Grupo Modelo
              </span>
              <span className="text-[10px] md:text-xs text-[#FFB81C] font-medium tracking-wider uppercase opacity-90">
                Control de Consumos de Mosto
              </span>
            </div>
          </div>

          {/* Derecha: Status y Usuario */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* SAP Connection Status */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300
                  ${isConnected 
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-100" 
                    : "bg-red-950/30 border-red-500/30 text-red-100"}
                `}>
                  <div className="relative">
                    <Server className="h-4 w-4" />
                    {isConnected && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="hidden md:inline text-xs font-medium">
                    {isConnected ? "SAP Conectado" : "SAP Desconectado"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#FFB81C] text-[#002855] font-bold border-none">
                <p>Estado de conexión con SAP RFC</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-white capitalize">
                  {user?.username}
                </span>
                <span className="text-[10px] text-white/60">
                  Operador
                </span>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-red-600 hover:text-white transition-all duration-300"
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