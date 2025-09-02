
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { User } from "@/api/entities";
import { TempShareLink } from "@/api/entities";
import { 
  Network, 
  Users, 
  Eye, 
  Settings, 
  Share2,
  Clock,
  AlertCircle,
  Download // <-- Ícono agregado
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShareLinkGenerator from "@/components/utils/ShareLinkGenerator";
import { createPageUrl } from "@/utils";
import { siteStructure } from "@/components/utils/sitemapData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // <-- Componente agregado
import { generateXMLSitemap } from "@/components/utils/sitemapGenerator"; // <-- Funcionalidad agregada
import { generateCSVChecklist } from "@/components/utils/siteChecklistGenerator"; // <-- Funcionalidad agregada
import { toast } from "sonner"; // <-- Componente agregado

export default function SiteMapPage() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTempAccess, setIsTempAccess] = useState(false);
  const [tempLinkData, setTempLinkData] = useState(null);
  const [showShareGenerator, setShowShareGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // <-- Estado agregado

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const urlParams = new URLSearchParams(location.search);
      const tempToken = urlParams.get('temp_access');
      
      if (tempToken) {
        // Usuario con acceso temporal
        const links = await TempShareLink.filter({ 
          token: tempToken, 
          status: "active" 
        });
        
        if (links.length > 0 && new Date(links[0].expires_at) > new Date()) {
          setIsTempAccess(true);
          setTempLinkData(links[0]);
          setLoading(false);
          return;
        }
      }
      
      // Usuario regular
      const userData = await User.me();
      setUser(userData);
      
      // Verificar si tiene permisos
      if (!['arrendador', 'admin', 'viewer'].includes(userData.user_type)) {
        // Redirigir a Home si no tiene permisos
        window.location.href = createPageUrl("Home");
        return;
      }
      
    } catch (error) {
      // Usuario no autenticado y sin token temporal
      window.location.href = createPageUrl("Home");
      return;
    }
    
    setLoading(false);
  };

  const downloadFile = (content, fileName, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format) => {
    setIsGenerating(true);
    try {
      if (format === 'xml') {
        const xmlContent = generateXMLSitemap();
        downloadFile(xmlContent, 'sitemap.xml', 'application/xml;charset=utf-8');
        toast.success("Sitemap XML generado y descargado con éxito.");
      } else if (format === 'csv') {
        const csvContent = generateCSVChecklist();
        const BOM = "\uFEFF"; // BOM para compatibilidad con Excel en UTF-8
        downloadFile(BOM + csvContent, 'sitemap_checklist.csv', 'text/csv;charset=utf-8;');
        toast.success("Checklist CSV generado y descargado con éxito.");
      }
    } catch (error) {
      console.error("Error al generar el archivo:", error);
      toast.error("Hubo un error al generar el archivo.");
    } finally {
      setIsGenerating(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canEdit = user && ['arrendador', 'admin'].includes(user.user_type);
  const isViewer = user && user.user_type === 'viewer';

  const crumbs = !isTempAccess ? [
    { label: 'Mi Cuenta', href: createPageUrl('MiCuenta') },
    { label: 'Mapa del Sitio' }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!isTempAccess && <Breadcrumbs crumbs={crumbs} />}
      
      {/* Header con alertas de acceso */}
      <div className="mb-8">
        {isTempAccess && (
          <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
            <Clock className="h-4 w-4 text-blue-700" />
            <AlertTitle className="text-blue-800">Acceso Temporal Activo</AlertTitle>
            <AlertDescription className="text-blue-700">
              Estás viendo esta página con un enlace temporal. 
              Expira: {new Date(tempLinkData.expires_at).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}
        
        {isViewer && !isTempAccess && (
          <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-700" />
            <AlertTitle className="text-blue-800">Modo Solo Lectura</AlertTitle>
            <AlertDescription className="text-blue-700">
              Estás viendo esta página como "Viewer". No puedes generar enlaces temporales.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 flex items-center space-x-3">
              <Network className="w-8 h-8 text-blue-600" />
              <span>Mapa del Sitio Web</span>
            </h1>
            <p className="text-xl text-slate-600">
              Estructura completa y checklist de ArriendosPuertoVaras.cl
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {canEdit && !isTempAccess && (
              <Button
                onClick={() => setShowShareGenerator(!showShareGenerator)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Generar Enlace Temporal
              </Button>
            )}

            {/* Botón de Descarga */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isGenerating}>
                  <Download className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generando...' : 'Descargar Sitemap'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleDownload('xml')}>
                  Descargar XML (para buscadores)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleDownload('csv')}>
                  Descargar Checklist (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Generador de enlaces temporales */}
      {showShareGenerator && canEdit && (
        <div className="mb-8">
          <ShareLinkGenerator />
        </div>
      )}

      {/* Estadísticas del sitio */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Páginas Principales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Landing, explorar, detalles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestión Usuario</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Perfil, reservas, cuenta</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panel Anfitrión</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Propiedades, servicios, IA</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funciones Especiales</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">Blog, ayuda, ofertas</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa visual del sitio */}
      <div className="grid gap-8">
        {/* Nivel 1: Páginas Principales */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Nivel 1: Páginas Principales</span>
              <Badge variant="secondary">Públicas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(siteStructure.mainPages).map(([key, page]) => (
                <div key={key} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-slate-900">{page.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">{page.description}</p>
                  <div className="text-xs text-blue-600 mb-2">
                    URL: {page.url}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {page.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nivel 2: Páginas de Detalle */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span>Nivel 2: Páginas de Detalle</span>
              <Badge variant="secondary">Públicas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(siteStructure.detailPages).map(([key, page]) => (
                <div key={key} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-slate-900">{page.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">{page.description}</p>
                  <div className="text-xs text-purple-600 mb-2">
                    URL: {page.url}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {page.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nivel 3: Gestión de Usuario */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>Nivel 3: Gestión de Usuario</span>
              <Badge variant="destructive">Requiere Login</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(siteStructure.userManagement).map(([key, page]) => (
                <div key={key} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-slate-900">{page.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">{page.description}</p>
                  <div className="text-xs text-green-600 mb-2">
                    URL: {page.url}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {page.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {page.userStates.map((state, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {state}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nivel 4: Gestión de Anfitrión */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-600 rounded"></div>
              <span>Nivel 4: Gestión de Anfitrión</span>
              <Badge variant="destructive">Solo Anfitriones</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(siteStructure.hostManagement).map(([key, page]) => (
                <div key={key} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-slate-900">{page.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">{page.description}</p>
                  <div className="text-xs text-orange-600 mb-2">
                    URL: {page.url}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {page.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leyenda */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Leyenda de Colores y Estados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Páginas Principales</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span>Páginas de Detalle</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>Gestión Usuario</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-600 rounded"></div>
              <span>Panel Anfitrión</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Públicas</Badge>
              <span>No requiere login</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="destructive">Requiere Login</Badge>
              <span>Solo usuarios registrados</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="destructive">Solo Anfitriones</Badge>
              <span>Usuarios con rol anfitrión</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
