import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Palette,
  Shield,
  Bell,
  Database,
  Mail,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Arriendos Puerto Varas',
    siteDescription: 'Plataforma de arriendos, servicios y experiencias en Puerto Varas',
    contactEmail: 'contacto@arriendospuertovaras.cl',
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    enableNotifications: true,
    themeColor: '#0F5E66',
    maxUploadSize: '5MB',
    sessionTimeout: '24',
    backupFrequency: 'daily'
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await User.me();
      
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      
      setUser(userData);
      // Load settings from localStorage or API
      loadSettings();
    } catch (error) {
      window.location.href = createPageUrl('Admin');
    }
    setLoading(false);
  };

  const loadSettings = () => {
    // In a real app, this would load from an API
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to an API
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    }
    setSaving(false);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="focus-outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <span>Configuración del Sistema</span>
            </h1>
            <p className="text-slate-600">Administra las configuraciones globales de la plataforma</p>
          </div>
        </div>
        
        <Button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Configuración General</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Nombre del Sitio</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Descripción del Sitio</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="contactEmail">Email de Contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Configuración de Seguridad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Mantenimiento</Label>
                  <p className="text-sm text-slate-500">
                    Desactiva el acceso público al sitio
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(value) => handleSettingChange('maintenanceMode', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir Nuevos Registros</Label>
                  <p className="text-sm text-slate-500">
                    Los usuarios pueden crear nuevas cuentas
                  </p>
                </div>
                <Switch
                  checked={settings.allowNewRegistrations}
                  onCheckedChange={(value) => handleSettingChange('allowNewRegistrations', value)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Verificación de Email Requerida</Label>
                  <p className="text-sm text-slate-500">
                    Los usuarios deben verificar su email
                  </p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(value) => handleSettingChange('requireEmailVerification', value)}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="sessionTimeout">Tiempo de Sesión (horas)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Configuración de Notificaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones Habilitadas</Label>
                  <p className="text-sm text-slate-500">
                    Sistema de notificaciones activo
                  </p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(value) => handleSettingChange('enableNotifications', value)}
                />
              </div>
              
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Las notificaciones por email están configuradas automáticamente
                  basadas en las preferencias de cada usuario.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Configuración de Apariencia</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="themeColor">Color Principal</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="themeColor"
                    type="color"
                    value={settings.themeColor}
                    onChange={(e) => handleSettingChange('themeColor', e.target.value)}
                    className="w-12 h-12 p-1 border rounded"
                  />
                  <Input
                    value={settings.themeColor}
                    onChange={(e) => handleSettingChange('themeColor', e.target.value)}
                    placeholder="#0F5E66"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Configuración del Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxUploadSize">Tamaño Máximo de Subida</Label>
                <Input
                  id="maxUploadSize"
                  value={settings.maxUploadSize}
                  onChange={(e) => handleSettingChange('maxUploadSize', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="backupFrequency">Frecuencia de Respaldos</Label>
                <select
                  id="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              
              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Los respaldos se realizan automáticamente según la frecuencia configurada.
                  Los archivos se almacenan de forma segura y encriptada.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}