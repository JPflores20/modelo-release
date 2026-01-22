import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderManagement } from "@/components/tabs/OrderManagement";
import { Button } from "@/components/ui/button"; // Aseguramos importar Button
import { 
  ClipboardList, 
  Factory, 
  FileText, 
  History, 
  BookOpen,
  ExternalLink // Nuevo icono importado
} from "lucide-react";

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkSapStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/status');
        const data = await response.json();
        setIsConnected(data.status === 'connected');
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkSapStatus();
    const intervalId = setInterval(checkSapStatus, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // URL proporcionada para el SOP
  const SOP_URL = "https://login.microsoftonline.com/cef04b19-7776-4a94-b89b-375c77a8f936/saml2?SAMLRequest=jZJJb8IwEIX%2FSuR7VgJuLIJE4VCkLqjQHnqpxmYClhybepwu%2F74Bul6qnv3me%2FPeeEzQmr2YdmFnb%2FGpQwrRa2ssieNDzTpvhQPSJCy0SCIosZpeXYoiycTeu%2BCUMyyaEqEP2tmZs9S16Ffon7XCu9vLmu1C2JNIU5CxthKfE1Cw0ZDQG4ExOlGuTVc7LaUzGHYJkUsPFkW6vFmtWTTvd9IWDvRvlnFbbZNWK%2B%2FINcFZoy0eSQqbrJR5FXPOR3EJVRnLs0rGAz5UnMNZUw1G6SFcwaLFvGaPldxg1U%2FluMmbIQc%2BymDQcMg4L2XZVL2MqMOFpQA21KzIilGc5XFRrLNMlJUYDh5YtPzo4lzbjbbbv4uTJxGJi%2FV6GZ9i3qOnY8RewCbjw4biaOx%2FHORvLHxegU3%2B0zl9dT5Of9idvPfiuucv5ktntHqLpsa4l5lHCFiznKWT08jvnzN5Bw%3D%3D&RelayState=ss%3Amem%3Abfc81d1110b32c906fbf87a8f028ebf0e4b9bea809484dbea4abf45ad502faef&sso_reload=true";

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header isConnected={isConnected} />

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* SISTEMA DE PESTAÑAS */}
        <Tabs defaultValue="orders" className="w-full space-y-6">
          
          {/* Navegación de Pestañas */}
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-white/50 backdrop-blur border border-blue-100 p-1 h-auto min-h-12 shadow-sm inline-flex w-full justify-start md:justify-center flex-wrap gap-1">
              
              <TabsTrigger 
                value="orders" 
                className="data-[state=active]:bg-[#002855] data-[state=active]:text-white px-4 py-2 h-10 gap-2 transition-all flex-1 min-w-[140px]"
              >
                <ClipboardList className="h-4 w-4" />
                <span className="whitespace-nowrap">Órdenes</span>
              </TabsTrigger>

              <TabsTrigger 
                value="consumos" 
                className="data-[state=active]:bg-[#002855] data-[state=active]:text-white px-4 py-2 h-10 gap-2 transition-all flex-1 min-w-[140px]"
              >
                <Factory className="h-4 w-4" />
                <span className="whitespace-nowrap">Consumos</span>
              </TabsTrigger>

              <TabsTrigger 
                value="recetas" 
                className="data-[state=active]:bg-[#002855] data-[state=active]:text-white px-4 py-2 h-10 gap-2 transition-all flex-1 min-w-[140px]"
              >
                <FileText className="h-4 w-4" />
                <span className="whitespace-nowrap">Gestión Recetas</span>
              </TabsTrigger>

              <TabsTrigger 
                value="sop" 
                className="data-[state=active]:bg-[#002855] data-[state=active]:text-white px-4 py-2 h-10 gap-2 transition-all flex-1 min-w-[100px]"
              >
                <BookOpen className="h-4 w-4" />
                <span className="whitespace-nowrap">SOP</span>
              </TabsTrigger>

              <TabsTrigger 
                value="cambios" 
                className="data-[state=active]:bg-[#002855] data-[state=active]:text-white px-4 py-2 h-10 gap-2 transition-all flex-1 min-w-[140px]"
              >
                <History className="h-4 w-4" />
                <span className="whitespace-nowrap">Control Cambios</span>
              </TabsTrigger>

            </TabsList>
          </div>

          {/* 1. Órdenes */}
          <TabsContent value="orders" className="outline-none space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <OrderManagement isConnected={isConnected} />
          </TabsContent>

          {/* 2. Consumos */}
          <TabsContent value="consumos" className="outline-none space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <Factory className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-500">Generación de Consumos</h3>
              <p className="text-sm text-gray-400 mt-2 text-center max-w-md">
                Módulo para el cálculo automático de mermas y notificaciones de producción (COR6N).
              </p>
            </div>
          </TabsContent>

          {/* 3. Gestión de Recetas */}
          <TabsContent value="recetas" className="outline-none space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <FileText className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-500">Gestión de Recetas Maestras</h3>
              <p className="text-sm text-gray-400 mt-2 text-center max-w-md">
                Visualización, edición y aprobación de versiones de producción y BOMs.
              </p>
            </div>
          </TabsContent>

          {/* 4. SOP (ACTUALIZADO CON BOTÓN) */}
          <TabsContent value="sop" className="outline-none space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-[#002855]/20 rounded-xl bg-white/60 p-8 shadow-sm">
              
              <div className="p-5 bg-blue-50 rounded-full shadow-inner mb-6 ring-1 ring-blue-100">
                <BookOpen className="h-14 w-14 text-[#002855]" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#002855] mb-2">Procedimientos Operativos (SOP)</h3>
              
              <p className="text-muted-foreground text-center max-w-lg mb-8 leading-relaxed">
                Acceda al repositorio oficial de Grupo Modelo para consultar manuales técnicos, 
                guías de usuario y protocolos de seguridad actualizados.
              </p>

              <Button 
                size="lg"
                className="bg-[#002855] hover:bg-[#001f40] text-white font-bold gap-3 px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-[#FFB81C]"
                onClick={() => window.open(SOP_URL, '_blank')}
              >
                <ExternalLink className="h-5 w-5 text-[#FFB81C]" />
                Acceder al Portal SOP
              </Button>

              <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1 opacity-70">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Enlace seguro autenticado por Microsoft Azure
              </p>
            </div>
          </TabsContent>

          {/* 5. Control Cambios */}
          <TabsContent value="cambios" className="outline-none space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <History className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-500">Log de Control de Cambios</h3>
              <p className="text-sm text-gray-400 mt-2 text-center max-w-md">
                Auditoría detallada de modificaciones en parámetros críticos.
              </p>
            </div>
          </TabsContent>

        </Tabs>

      </main>

      <footer className="bg-[#002855] text-white/60 py-3 text-center text-xs border-t border-[#FFB81C]/30">
        © 2024 Grupo Modelo México. Sistema ZEUS v1.0
      </footer>
    </div>
  );
};

export default Dashboard;