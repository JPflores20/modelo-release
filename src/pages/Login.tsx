import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Lock, User, Beer, ArrowRight, Loader2 } from "lucide-react";

const Login = () => {
  // --- LÓGICA ORIGINAL ---
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network delay (Original)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = login(username, password);
    if (!success) {
      setError("Credenciales inválidas. Intente de nuevo.");
    }
    setIsLoading(false);
  };
  // -----------------------

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#002855] via-[#001f40] to-black p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo (Diseño) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#FFB81C] shadow-[0_0_20px_rgba(255,184,28,0.5)]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#002855] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FFB81C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header / Logo Branding */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Beer className="w-12 h-12 text-[#FFB81C] drop-shadow-md" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Grupo Modelo
            </h1>
            <p className="text-blue-100/80 text-sm font-light tracking-wider uppercase">
              Sistema de Liberación de Órdenes
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          {/* Línea de acento dorada */}
          <div className="h-1.5 w-full bg-[#FFB81C]" />
          
          <CardHeader className="space-y-1 pb-6 text-center">
            <CardTitle className="text-xl text-[#002855] font-bold">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm animate-in zoom-in-95 duration-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2 group">
                <Label htmlFor="username" className="text-[#002855]/80 group-focus-within:text-[#002855] transition-colors">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#FFB81C] transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-input transition-all duration-200 focus:border-[#FFB81C] focus:ring-[#FFB81C]/20"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="password" className="text-[#002855]/80 group-focus-within:text-[#002855] transition-colors">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#FFB81C] transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-input transition-all duration-200 focus:border-[#FFB81C] focus:ring-[#FFB81C]/20"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FFB81C] hover:bg-[#e5a50a] text-[#002855] font-bold shadow-lg shadow-[#FFB81C]/20 transition-all duration-300 hover:translate-y-[-1px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Ingresar
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-4 border-t border-dashed flex justify-center">
              <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                Credenciales de demo: <strong>operador</strong> / <strong>modelo2024</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-xs text-blue-200/40 text-center font-light">
          © 2024 Grupo Modelo México. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;