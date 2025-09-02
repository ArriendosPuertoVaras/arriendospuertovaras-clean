import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TempShareLink } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  Eye, 
  Shield, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function ShareLinkPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    validateAndLoadLink();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  const validateAndLoadLink = async () => {
    try {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        setError("Enlace inválido: No se encontró el token de acceso.");
        setLoading(false);
        return;
      }

      // Buscar el enlace en la base de datos
      const links = await TempShareLink.filter({ token: token, status: "active" });
      
      if (links.length === 0) {
        setError("Este enlace ha expirado o no existe.");
        setLoading(false);
        return;
      }

      const link = links[0];
      
      // Verificar si ha expirado
      const now = new Date();
      const expiresAt = new Date(link.expires_at);
      
      if (now > expiresAt) {
        // Marcar como expirado
        await TempShareLink.update(link.id, { status: "expired" });
        setError("Este enlace ha expirado.");
        setLoading(false);
        return;
      }

      // Verificar límite de accesos
      if (link.access_count >= link.max_accesses) {
        setError("Este enlace ha alcanzado el límite máximo de accesos.");
        setLoading(false);
        return;
      }

      // Registrar el acceso
      const visitorInfo = {
        ip: "hidden_for_privacy",
        user_agent: navigator.userAgent.substring(0, 100),
        accessed_at: new Date().toISOString()
      };
      
      await TempShareLink.update(link.id, {
        access_count: link.access_count + 1,
        visitor_info: [...(link.visitor_info || []), visitorInfo]
      });

      setLinkData(link);
      setLoading(false);
    } catch (error) {
      console.error("Error validating link:", error);
      setError("Error al validar el enlace.");
      setLoading(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!linkData) return;
    
    const now = new Date();
    const expiresAt = new Date(linkData.expires_at);
    const diff = expiresAt - now;
    
    if (diff <= 0) {
      setTimeRemaining("Expirado");
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  };

  const handleAccessPage = () => {
    // Redirigir a la página objetivo con parámetro especial
    const targetUrl = `/${linkData.target_page}?temp_access=${linkData.token}`;
    window.location.href = targetUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Enlace No Válido</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="text-sm text-slate-600 text-center">
              Por favor, solicita un nuevo enlace al administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-800">Acceso Temporal Autorizado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-slate-700 mb-4">
                Has sido invitado a revisar el contenido de Arriendos Puerto Varas.
              </p>
              {linkData.description && (
                <p className="text-sm text-slate-600 italic">
                  "{linkData.description}"
                </p>
              )}
            </div>

            {/* Información del enlace */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg border">
                <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-700">Tiempo restante</div>
                <div className="text-lg font-bold text-blue-600">{timeRemaining}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-700">Accesos usados</div>
                <div className="text-lg font-bold text-purple-600">
                  {linkData.access_count} / {linkData.max_accesses}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-700">Solo lectura</div>
                <div className="text-sm font-bold text-green-600">Garantizado</div>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Este es un enlace de solo lectura. No podrás realizar cambios ni editar información.
                El enlace se eliminará automáticamente cuando expire.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button 
                onClick={handleAccessPage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Acceder a {linkData.target_page === 'SiteMap' ? 'Mapa del Sitio' : linkData.target_page}
              </Button>
            </div>

            <div className="text-xs text-slate-500 text-center">
              Este enlace es único y personal. No lo compartas con terceros.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}