import React, { useState } from "react";
import { TempShareLink } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Link2, 
  Copy, 
  Clock, 
  Share2, 
  CheckCircle,
  Eye
} from "lucide-react";
import { toast } from "sonner";

export default function ShareLinkGenerator() {
  const [targetPage, setTargetPage] = useState("SiteMap");
  const [description, setDescription] = useState("");
  const [maxAccesses, setMaxAccesses] = useState(10);
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSecureToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      // Obtener el usuario actual
      const user = await User.me();
      
      // Generar token único
      const token = generateSecureToken();
      
      // Calcular fecha de expiración (3 horas)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 3);
      
      // Crear el enlace temporal
      await TempShareLink.create({
        token: token,
        creator_id: user.id,
        target_page: targetPage,
        expires_at: expiresAt.toISOString(),
        max_accesses: maxAccesses,
        description: description,
        status: "active"
      });
      
      // Generar la URL completa
      const shareUrl = `${window.location.origin}/ShareLink?token=${token}`;
      setGeneratedLink(shareUrl);
      
      toast.success("Enlace temporal generado exitosamente");
    } catch (error) {
      console.error("Error generating link:", error);
      toast.error("Error al generar el enlace temporal");
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Enlace copiado al portapapeles");
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = generatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="w-5 h-5" />
          <span>Generar Enlace Temporal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            El enlace generado será válido por <strong>3 horas</strong> y se autodestruirá automáticamente.
            Solo permite acceso de <strong>solo lectura</strong>.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="targetPage">Página a Compartir</Label>
            <Select value={targetPage} onValueChange={setTargetPage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SiteMap">Mapa del Sitio</SelectItem>
                <SelectItem value="Dashboard">Dashboard IA</SelectItem>
                <SelectItem value="Properties">Propiedades</SelectItem>
                <SelectItem value="Services">Servicios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input
              id="description"
              placeholder="Ej: Revisión del mapa del sitio para el equipo de marketing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="maxAccesses">Máximo de Accesos</Label>
            <Select value={maxAccesses.toString()} onValueChange={(value) => setMaxAccesses(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 accesos</SelectItem>
                <SelectItem value="10">10 accesos</SelectItem>
                <SelectItem value="20">20 accesos</SelectItem>
                <SelectItem value="50">50 accesos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleGenerateLink} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generando...
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              Generar Enlace Temporal
            </>
          )}
        </Button>

        {generatedLink && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Enlace generado exitosamente</span>
            </div>
            
            <div className="space-y-2">
              <Label>Enlace Temporal (válido por 3 horas)</Label>
              <div className="flex space-x-2">
                <Input 
                  value={generatedLink} 
                  readOnly 
                  className="bg-white"
                />
                <Button 
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-green-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Expira en 3 horas</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>Máximo {maxAccesses} accesos</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}