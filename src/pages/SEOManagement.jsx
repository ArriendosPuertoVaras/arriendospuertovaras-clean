
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SEOSettings } from "@/api/entities";
import SitemapGenerator from "../components/analytics/SitemapGenerator.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Globe, 
  BarChart3, 
  Settings,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { toast } from "sonner";

// Dummy definition for createPageUrl to ensure functionality as it's used in the outline but not defined.
// In a real application, this would typically be imported from a utility file.
const createPageUrl = (pageName) => {
  switch (pageName) {
    case 'Home':
      return '/';
    // Add other cases as needed based on your application's routing
    default:
      return `/${pageName.toLowerCase()}`;
  }
};

export default function SEOManagementPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    ga_measurement_id: "G-9ZGG23T6WF",
    search_console_verification: "" // Changed default placeholder
  });
  const [settingsId, setSettingsId] = useState(null); // To store the ID of the settings record

  useEffect(() => {
    loadUserAndSettings();
  }, []);

  const loadUserAndSettings = async () => {
    setLoading(true); // Set loading to true at the beginning
    try {
      const userData = await User.me();
      if (!userData || userData.role !== 'admin') {
        toast.error("Acceso denegado.");
        window.location.href = createPageUrl('Home');
        return;
      }
      setUser(userData);

      const existingSettings = await SEOSettings.list();
      if (existingSettings.length > 0) {
        const currentSettings = existingSettings[0];
        setSettings({
          ga_measurement_id: currentSettings.ga_measurement_id || "G-9ZGG23T6WF",
          search_console_verification: currentSettings.search_console_verification || "" // Changed default placeholder
        });
        setSettingsId(currentSettings.id); // Store the ID
      }
    } catch (error) {
      console.error("Error loading user or settings:", error); // Updated error message
      toast.error("No se pudo cargar la configuración. Intenta de nuevo."); // Updated toast message
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ga_measurement_id: settings.ga_measurement_id,
        search_console_verification: settings.search_console_verification
      };

      if (settingsId) {
        // Update existing settings
        await SEOSettings.update(settingsId, dataToSave);
      } else {
        // Create new settings if none exist
        const newSettings = await SEOSettings.create({ ...dataToSave, ai_seo_enabled: true });
        setSettingsId(newSettings.id); // Store the ID for future updates
      }
      
      toast.success("Configuración guardada. Recargando para aplicar cambios..."); // Updated toast message
      
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Changed timeout duration
      
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error al guardar la configuración."); // Updated toast message
    }
    setSaving(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Gestión SEO y Analytics
          </h1>
          <p className="text-slate-600">
            Configuración de herramientas de seguimiento y optimización SEO
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Google Analytics Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Google Analytics 4
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ga-tracking-id">Measurement ID</Label>
              <div className="flex gap-2">
                <Input
                  id="ga-tracking-id"
                  value={settings.ga_measurement_id}
                  onChange={(e) => setSettings({...settings, ga_measurement_id: e.target.value})}
                  placeholder="G-XXXXXXXXXX"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(settings.ga_measurement_id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Encuentra tu Measurement ID en Google Analytics → Admin → Flujos de datos
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Eventos configurados:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Badge variant="outline">page_view</Badge>
                <Badge variant="outline">search</Badge>
                <Badge variant="outline">view_item</Badge>
                <Badge variant="outline">begin_checkout</Badge>
                <Badge variant="outline">purchase</Badge>
                <Badge variant="outline">sign_up</Badge>
                <Badge variant="outline">jaime_chat_open</Badge>
                <Badge variant="outline">property_published</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Search Console Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-green-600" />
              Google Search Console
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search-console-verification">Código de verificación</Label>
              <div className="flex gap-2">
                <Input
                  id="search-console-verification"
                  value={settings.search_console_verification}
                  onChange={(e) => setSettings({...settings, search_console_verification: e.target.value})}
                  placeholder="Código de verificación HTML"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(settings.search_console_verification)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Copia el código de la meta tag de verificación de Search Console
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Pasos para configurar:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
                <li>Ve a <a href="https://search.google.com/search-console/" className="underline" target="_blank" rel="noopener noreferrer">Google Search Console</a></li>
                <li>Añade la propiedad: arriendospuertovaras.cl</li>
                <li>Selecciona verificación por etiqueta HTML</li>
                <li>Copia el código de verificación aquí</li>
                <li>Guarda la configuración</li>
                <li>Vuelve a Search Console y verifica</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <a 
                  href="https://analytics.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Analytics
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sitemap Generator */}
        <SitemapGenerator />

        {/* SEO Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Checklist SEO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Google Analytics 4 instalado y configurado</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span>Google Search Console verificado</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span>Sitemap.xml enviado a Search Console</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Meta tags de geolocalización configuradas</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Structured data (Schema.org) implementado</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span>Eventos de conversión configurados</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded" />
                  <span>País objetivo configurado (Chile)</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
