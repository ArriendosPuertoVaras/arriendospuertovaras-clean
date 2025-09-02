import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { SEOSettings } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
    Settings, 
    Globe, 
    BarChart3, 
    FileText, 
    Palette,
    Shield,
    Database,
    Mail,
    Smartphone,
    CreditCard,
    Save,
    RefreshCw
} from 'lucide-react';

export default function AdminConfiguracion() {
    const [seoSettings, setSeoSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('seo');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await SEOSettings.filter({});
            if (settings.length > 0) {
                setSeoSettings(settings[0]);
            } else {
                // Crear configuración por defecto
                const defaultSettings = await SEOSettings.create({
                    ga_measurement_id: 'G-9ZGG23T6WF',
                    ai_seo_enabled: true,
                    target_language: 'both',
                    max_publications_per_week: 3,
                    target_keywords: ['arriendos puerto varas', 'cabañas puerto varas', 'alojamiento puerto varas'],
                    cro_testing_enabled: true,
                    auto_winner_selection: true,
                    min_sample_size: 500,
                    test_duration_days: 14,
                    content_tone: 'local',
                    schema_markup_enabled: true,
                    sitemap_auto_update: true
                });
                setSeoSettings(defaultSettings);
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            toast.error('Error al cargar configuración');
        }
        setLoading(false);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await SEOSettings.update(seoSettings.id, seoSettings);
            toast.success('Configuración guardada exitosamente');
        } catch (error) {
            console.error('Error guardando configuración:', error);
            toast.error('Error al guardar configuración');
        }
        setSaving(false);
    };

    const configTabs = [
        { id: 'seo', label: 'SEO & Analytics', icon: BarChart3 },
        { id: 'plataforma', label: 'Plataforma', icon: Settings },
        { id: 'pagos', label: 'Pagos', icon: CreditCard },
        { id: 'notificaciones', label: 'Notificaciones', icon: Mail },
        { id: 'seguridad', label: 'Seguridad', icon: Shield },
        { id: 'sistema', label: 'Sistema', icon: Database }
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-slate-600" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Configuración del Sistema</h2>
                        <p className="text-slate-600 mt-1">Gestiona la configuración global de la plataforma</p>
                    </div>
                    <Button onClick={saveSettings} disabled={saving} className="bg-green-600 hover:bg-green-700">
                        {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>

                {/* Tabs de configuración */}
                <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
                    {configTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'btn-neu text-slate-700 hover:text-purple-700'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Contenido de las pestañas */}
                {activeTab === 'seo' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5" />
                                    Google Analytics & SEO
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="ga_id">Google Analytics Measurement ID</Label>
                                    <Input
                                        id="ga_id"
                                        value={seoSettings?.ga_measurement_id || ''}
                                        onChange={(e) => setSeoSettings({...seoSettings, ga_measurement_id: e.target.value})}
                                        placeholder="G-XXXXXXXXXX"
                                    />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="ai_seo">Motor SEO por IA</Label>
                                    <Switch
                                        id="ai_seo"
                                        checked={seoSettings?.ai_seo_enabled || false}
                                        onCheckedChange={(checked) => setSeoSettings({...seoSettings, ai_seo_enabled: checked})}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="target_lang">Idioma Objetivo</Label>
                                    <Select 
                                        value={seoSettings?.target_language || 'both'}
                                        onValueChange={(value) => setSeoSettings({...seoSettings, target_language: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="es-CL">Español (Chile)</SelectItem>
                                            <SelectItem value="en-US">English (US)</SelectItem>
                                            <SelectItem value="both">Ambos idiomas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="max_posts">Máx. publicaciones por semana</Label>
                                    <Input
                                        id="max_posts"
                                        type="number"
                                        value={seoSettings?.max_publications_per_week || 3}
                                        onChange={(e) => setSeoSettings({...seoSettings, max_publications_per_week: parseInt(e.target.value)})}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Testing CRO & A/B
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="ab_testing">Testing A/B Activado</Label>
                                    <Switch
                                        id="ab_testing"
                                        checked={seoSettings?.cro_testing_enabled || false}
                                        onCheckedChange={(checked) => setSeoSettings({...seoSettings, cro_testing_enabled: checked})}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="auto_winner">Selección automática de ganadores</Label>
                                    <Switch
                                        id="auto_winner"
                                        checked={seoSettings?.auto_winner_selection || false}
                                        onCheckedChange={(checked) => setSeoSettings({...seoSettings, auto_winner_selection: checked})}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="sample_size">Mínimo de impresiones para test</Label>
                                    <Input
                                        id="sample_size"
                                        type="number"
                                        value={seoSettings?.min_sample_size || 500}
                                        onChange={(e) => setSeoSettings({...seoSettings, min_sample_size: parseInt(e.target.value)})}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="test_duration">Duración máxima de test (días)</Label>
                                    <Input
                                        id="test_duration"
                                        type="number"
                                        value={seoSettings?.test_duration_days || 14}
                                        onChange={(e) => setSeoSettings({...seoSettings, test_duration_days: parseInt(e.target.value)})}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'plataforma' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Configuración General
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <h3 className="font-semibold mb-2">Estado del Sistema</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Plataforma:</span>
                                            <Badge variant="success">Activa</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Base de Datos:</span>
                                            <Badge variant="success">Conectada</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Modo Mantenimiento:</span>
                                            <Badge variant="secondary">Desactivado</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Contenido y Tono
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="content_tone">Tono del contenido generado</Label>
                                    <Select 
                                        value={seoSettings?.content_tone || 'local'}
                                        onValueChange={(value) => setSeoSettings({...seoSettings, content_tone: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="formal">Formal</SelectItem>
                                            <SelectItem value="casual">Casual</SelectItem>
                                            <SelectItem value="local">Local (Puerto Varas)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="schema_markup">Schema.org automático</Label>
                                    <Switch
                                        id="schema_markup"
                                        checked={seoSettings?.schema_markup_enabled || false}
                                        onCheckedChange={(checked) => setSeoSettings({...seoSettings, schema_markup_enabled: checked})}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="sitemap_auto">Actualizador automático de sitemaps</Label>
                                    <Switch
                                        id="sitemap_auto"
                                        checked={seoSettings?.sitemap_auto_update || false}
                                        onCheckedChange={(checked) => setSeoSettings({...seoSettings, sitemap_auto_update: checked})}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Otras pestañas pueden tener contenido placeholder por ahora */}
                {activeTab === 'pagos' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Configuración de Pagos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600">Configuración de métodos de pago y Webpay Plus.</p>
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 font-semibold">✅ Webpay Plus configurado y activo</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'notificaciones' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Configuración de Notificaciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600">Gestiona emails automáticos, SMS y notificaciones push.</p>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'seguridad' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Configuración de Seguridad
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600">HTTPS, CORS, autenticación y políticas de seguridad.</p>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'sistema' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Sistema y Rendimiento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600">Monitoreo, logs, backups y configuración de base de datos.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}