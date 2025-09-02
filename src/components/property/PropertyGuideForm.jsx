import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadFile } from "@/api/integrations";
import { Upload, FileText, Save, Copy, Info } from "lucide-react";
import { toast } from "sonner";

const predefinedGuides = [
  {
    name: "Cabaña Estándar",
    template: {
      house_rules: "• No fumar en interiores\n• Mascotas no permitidas\n• Máximo de ruido hasta las 22:00\n• No fiestas o eventos",
      check_in_instructions: "El check-in es entre las 15:00 y 20:00. Las llaves están en la caja de seguridad junto a la puerta principal. El código es: [CÓDIGO]",
      included_services: "• WiFi gratuito\n• Estacionamiento privado\n• Calefacción\n• Ropa de cama y toallas\n• Productos básicos de baño",
      local_recommendations: "• Restaurante Don Luis (5 min caminando) - comida típica\n• Supermercado Líder (10 min auto)\n• Centro de Puerto Varas (15 min auto)\n• Mirador del Lago (20 min caminando)"
    }
  },
  {
    name: "Departamento Urbano",
    template: {
      house_rules: "• Edificio con portería 24/7\n• No mascotas\n• Respetar espacios comunes\n• Separar basura según indicaciones",
      check_in_instructions: "Presentarse en portería con identificación. El conserje entregará las llaves. Check-in hasta las 22:00.",
      included_services: "• WiFi de alta velocidad\n• Calefacción central\n• Acceso a gimnasio del edificio\n• Piscina (temporada de verano)",
      local_recommendations: "• Mall Puerto Varas (2 cuadras)\n• Costanera (5 min caminando)\n• Restaurants en German Street\n• Terminal de buses (10 min auto)"
    }
  }
];

export default function PropertyGuideForm({ guide, onSave, onCancel }) {
  const [formData, setFormData] = useState(guide || {
    house_rules: '',
    check_in_instructions: '',
    check_out_instructions: '',
    included_services: '',
    excluded_services: '',
    local_recommendations: '',
    emergency_contact: '',
    wifi_password: '',
    heating_instructions: '',
    appliances_guide: '',
    parking_instructions: '',
    guide_files: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    toast.info("Subiendo archivos de guía...");

    try {
      const uploadPromises = files.map(async file => {
        const result = await UploadFile({ file });
        return {
          name: file.name,
          url: result.file_url,
          type: file.type.includes('pdf') ? 'pdf' : 'image'
        };
      });
      
      const fileData = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        guide_files: [...(prev.guide_files || []), ...fileData]
      }));
      
      toast.success(`${files.length} archivo(s) subido(s) correctamente.`);
    } catch (error) {
      toast.error("Error al subir los archivos.");
    }
    setLoading(false);
  };

  const applyTemplate = (templateName) => {
    const template = predefinedGuides.find(t => t.name === templateName);
    if (template) {
      setFormData(prev => ({ ...prev, ...template.template }));
      toast.success(`Plantilla "${templateName}" aplicada.`);
    }
  };

  const handleSave = () => {
    onSave(formData);
    toast.success("Guía de propiedad guardada.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Guía de la Propiedad</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="templates">Plantillas</TabsTrigger>
            <TabsTrigger value="files">Archivos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="house_rules">Normas de la Casa</Label>
                <Textarea
                  id="house_rules"
                  value={formData.house_rules}
                  onChange={(e) => handleInputChange('house_rules', e.target.value)}
                  placeholder="Reglas que los huéspedes deben seguir..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="check_in_instructions">Instrucciones de Check-in</Label>
                <Textarea
                  id="check_in_instructions"
                  value={formData.check_in_instructions}
                  onChange={(e) => handleInputChange('check_in_instructions', e.target.value)}
                  placeholder="Cómo llegar y obtener las llaves..."
                  rows={4}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="included_services">Servicios Incluidos</Label>
                <Textarea
                  id="included_services"
                  value={formData.included_services}
                  onChange={(e) => handleInputChange('included_services', e.target.value)}
                  placeholder="Qué está incluido en el precio..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="local_recommendations">Recomendaciones Locales</Label>
                <Textarea
                  id="local_recommendations"
                  value={formData.local_recommendations}
                  onChange={(e) => handleInputChange('local_recommendations', e.target.value)}
                  placeholder="Lugares y actividades cercanas..."
                  rows={3}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergency_contact">Contacto de Emergencia</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div>
                <Label htmlFor="wifi_password">Contraseña WiFi</Label>
                <Input
                  id="wifi_password"
                  value={formData.wifi_password}
                  onChange={(e) => handleInputChange('wifi_password', e.target.value)}
                  placeholder="ContraseñaWiFi123"
                />
              </div>
              <div>
                <Label htmlFor="parking_instructions">Estacionamiento</Label>
                <Input
                  id="parking_instructions"
                  value={formData.parking_instructions}
                  onChange={(e) => handleInputChange('parking_instructions', e.target.value)}
                  placeholder="Ubicación del estacionamiento..."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Utiliza una plantilla predefinida como punto de partida y personalízala según tu propiedad.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              {predefinedGuides.map(template => (
                <div key={template.name} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{template.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template.name)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Usar Plantilla
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Sube PDFs con instrucciones detalladas o imágenes explicativas (máx. 5MB por archivo).
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {formData.guide_files?.map((file, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <Label htmlFor="guide-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <span className="text-blue-600 font-medium">Subir archivos de guía</span>
                <p className="text-xs text-slate-500 mt-1">
                  PDF, JPG, PNG - máx. 5MB por archivo
                </p>
              </div>
            </Label>
            <Input 
              id="guide-upload" 
              type="file" 
              multiple 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Guía
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}