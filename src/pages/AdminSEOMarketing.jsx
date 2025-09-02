
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Search, 
  Globe, 
  FileText, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Settings,
  Tag,
  Users,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { SEOContent } from '@/api/entities';
import { BlogPost } from '@/api/entities';
import { Property } from '@/api/entities';
import { ProfessionalService } from '@/api/entities';

export default function AdminSEOMarketingPage() {
    const [seoPages, setSeoPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPages, setSelectedPages] = useState([]);
    const [sitemapStatus, setSitemapStatus] = useState(null);
    const [rebuildingMap, setRebuildingMap] = useState(false);

    // These utility functions do not depend on component state or props,
    // so they are stable and can be defined outside or before useCallback.
    const getTitleStatus = (title) => {
        if (!title) return 'missing';
        if (title.length < 30) return 'short';
        if (title.length > 60) return 'long';
        return 'good';
    };

    const getMetaStatus = (meta) => {
        if (!meta) return 'missing';
        if (meta.length < 120) return 'short';
        if (meta.length > 155) return 'long';
        return 'good';
    };

    // Wrap data loading functions with useCallback to stabilize them for useEffect dependencies
    const loadSEOData = useCallback(async () => {
        try {
            setLoading(true);
            // Cargar páginas de SEO existentes
            const seoContent = await SEOContent.list();
            
            // Agregar datos calculados para cada página
            const enrichedPages = seoContent.map(page => ({
                ...page,
                titleLength: page.title?.length || 0,
                metaLength: page.meta_description?.length || 0,
                titleStatus: getTitleStatus(page.title), // These are stable
                metaStatus: getMetaStatus(page.meta_description), // These are stable
                duplicateTitle: false, // Se calculará después
                duplicateMeta: false   // Se calculará después
            }));

            // Detectar duplicados
            enrichedPages.forEach((page, index) => {
                const titleDuplicates = enrichedPages.filter(p => p.title === page.title && p.id !== page.id);
                const metaDuplicates = enrichedPages.filter(p => p.meta_description === page.meta_description && p.id !== page.id);
                
                enrichedPages[index].duplicateTitle = titleDuplicates.length > 0;
                enrichedPages[index].duplicateMeta = metaDuplicates.length > 0;
            });

            setSeoPages(enrichedPages);
        } catch (error) {
            console.error('Error loading SEO data:', error);
            toast.error('Error al cargar datos de SEO');
        }
        setLoading(false);
    }, []); // Dependencies: empty array as all internal dependencies are stable or state setters

    const loadSitemapStatus = useCallback(async () => {
        try {
            // Simular carga del estado del sitemap
            setSitemapStatus({
                lastBuild: new Date().toISOString(),
                totalUrls: 247,
                status: 'active',
                fileSize: '45KB'
            });
        } catch (error) {
            console.error('Error loading sitemap status:', error);
        }
    }, []); // Dependencies: empty array as all internal dependencies are stable or state setters

    useEffect(() => {
        loadSEOData();
        loadSitemapStatus();
    }, [loadSEOData, loadSitemapStatus]); // Add loadSEOData and loadSitemapStatus to dependency array

    const getStatusBadge = (status, isDuplicate = false) => {
        if (isDuplicate) {
            return <Badge variant="destructive" className="text-xs">Duplicado</Badge>;
        }
        
        switch (status) {
            case 'good':
                return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Bueno</Badge>;
            case 'short':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">Corto</Badge>;
            case 'long':
                return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">Largo</Badge>;
            case 'missing':
                return <Badge variant="destructive" className="text-xs">Falta</Badge>;
            default:
                return null;
        }
    };

    const handleSelectPage = (pageId, checked) => {
        if (checked) {
            setSelectedPages([...selectedPages, pageId]);
        } else {
            setSelectedPages(selectedPages.filter(id => id !== pageId));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            // Ensure filteredPages is defined before use
            setSelectedPages(filteredPages.map(page => page.id));
        } else {
            setSelectedPages([]);
        }
    };

    const handleBulkNoIndex = async () => {
        try {
            const updatePromises = selectedPages.map(pageId => 
                SEOContent.update(pageId, { no_index: true })
            );
            await Promise.all(updatePromises);
            toast.success(`${selectedPages.length} páginas marcadas como noindex`);
            setSelectedPages([]);
            loadSEOData(); // Call the stable version
        } catch (error) {
            toast.error('Error al actualizar páginas');
        }
    };

    const handleBulkIndex = async () => {
        try {
            const updatePromises = selectedPages.map(pageId => 
                SEOContent.update(pageId, { no_index: false })
            );
            await Promise.all(updatePromises);
            toast.success(`${selectedPages.length} páginas marcadas como index`);
            setSelectedPages([]);
            loadSEOData(); // Call the stable version
        } catch (error) {
            toast.error('Error al actualizar páginas');
        }
    };

    const handleRebuildSitemap = async () => {
        try {
            setRebuildingMap(true);
            
            // Simular reconstrucción del sitemap
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            toast.success('Sitemap reconstruido exitosamente');
            loadSitemapStatus(); // Call the stable version
        } catch (error) {
            toast.error('Error al reconstruir sitemap');
        }
        setRebuildingMap(false);
    };

    const filteredPages = seoPages.filter(page => 
        page.page_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout requiredRole={["admin", "superadmin"]}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">SEO & Marketing</h1>
                        <p className="text-sm text-slate-500 mt-1">Gestiona SEO, sitemaps y herramientas de marketing</p>
                    </div>
                </div>

                <Tabs defaultValue="seo" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="seo" className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            SEO On-Page
                        </TabsTrigger>
                        <TabsTrigger value="sitemap" className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Sitemaps
                        </TabsTrigger>
                        <TabsTrigger value="marketing" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Marketing
                        </TabsTrigger>
                    </TabsList>

                    {/* SEO On-Page Tab */}
                    <TabsContent value="seo" className="space-y-6">
                        <Card className="neu-card">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="w-5 h-5" />
                                        URLs Públicas ({filteredPages.length})
                                    </CardTitle>
                                    
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Buscar páginas..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-64"
                                        />
                                    </div>
                                </div>
                                
                                {selectedPages.length > 0 && (
                                    <div className="flex items-center gap-2 pt-4 border-t">
                                        <span className="text-sm text-slate-600">
                                            {selectedPages.length} páginas seleccionadas
                                        </span>
                                        <Button size="sm" variant="outline" onClick={handleBulkIndex}>
                                            Marcar como Index
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleBulkNoIndex}>
                                            Marcar como NoIndex
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                                        Cargando páginas...
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Encabezados de tabla */}
                                        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-slate-500 uppercase tracking-wide pb-2 border-b">
                                            <div className="col-span-1">
                                                <Checkbox
                                                    checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </div>
                                            <div className="col-span-4">URL / Título</div>
                                            <div className="col-span-3">Meta Description</div>
                                            <div className="col-span-2">Estados</div>
                                            <div className="col-span-1">Index</div>
                                            <div className="col-span-1">Acciones</div>
                                        </div>

                                        {/* Filas de datos */}
                                        {filteredPages.map((page) => (
                                            <div key={page.id} className="grid grid-cols-12 gap-4 py-3 border-b border-slate-100 hover:bg-slate-50">
                                                <div className="col-span-1 flex items-center">
                                                    <Checkbox
                                                        checked={selectedPages.includes(page.id)}
                                                        onCheckedChange={(checked) => handleSelectPage(page.id, checked)}
                                                    />
                                                </div>
                                                
                                                <div className="col-span-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <a 
                                                                href={page.page_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                            >
                                                                {page.page_url}
                                                            </a>
                                                            <ExternalLink className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                        <div className="text-sm text-slate-900 line-clamp-2">
                                                            {page.title || 'Sin título'}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(page.titleStatus, page.duplicateTitle)}
                                                            <span className="text-xs text-slate-500">
                                                                {page.titleLength} chars
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="col-span-3">
                                                    <div className="space-y-1">
                                                        <div className="text-sm text-slate-600 line-clamp-2">
                                                            {page.meta_description || 'Sin meta description'}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(page.metaStatus, page.duplicateMeta)}
                                                            <span className="text-xs text-slate-500">
                                                                {page.metaLength} chars
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="col-span-2">
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="outline" className="text-xs w-fit">
                                                            {page.page_type}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs w-fit">
                                                            {page.language || 'es-CL'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                <div className="col-span-1 flex items-center">
                                                    {page.no_index ? (
                                                        <Badge variant="destructive" className="text-xs">NoIndex</Badge>
                                                    ) : (
                                                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Index</Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="col-span-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sitemap Tab */}
                    <TabsContent value="sitemap" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="neu-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        Estado del Sitemap
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {sitemapStatus && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Estado:</span>
                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Activo
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Última actualización:</span>
                                                <span className="text-sm font-medium">
                                                    {new Date(sitemapStatus.lastBuild).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Total URLs:</span>
                                                <span className="text-sm font-medium">{sitemapStatus.totalUrls}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-slate-600">Tamaño:</span>
                                                <span className="text-sm font-medium">{sitemapStatus.fileSize}</span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="neu-card">
                                <CardHeader>
                                    <CardTitle>Acciones del Sitemap</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button 
                                        onClick={handleRebuildSitemap} 
                                        disabled={rebuildingMap}
                                        className="w-full"
                                    >
                                        {rebuildingMap ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                Reconstruyendo...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Reconstruir Sitemap
                                            </>
                                        )}
                                    </Button>
                                    
                                    <Button variant="outline" className="w-full">
                                        <Download className="w-4 h-4 mr-2" />
                                        Descargar sitemap.xml
                                    </Button>
                                    
                                    <div className="text-xs text-slate-500 space-y-1">
                                        <p>• Incluye: Propiedades, Servicios, Blog, Páginas informativas</p>
                                        <p>• Excluye: Admin, API, Robots, Sitemaps</p>
                                        <p>• Validación XML automática antes de publicar</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Marketing Tab */}
                    <TabsContent value="marketing" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Cupones y Descuentos */}
                            <Card className="neu-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="w-5 h-5" />
                                        Cupones y Descuentos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button className="w-full">
                                        <Tag className="w-4 h-4 mr-2" />
                                        Crear Nuevo Cupón
                                    </Button>
                                    
                                    <div className="space-y-3">
                                        <div className="p-3 border border-slate-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm">VERANO2024</span>
                                                <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
                                            </div>
                                            <div className="text-sm text-slate-600 space-y-1">
                                                <p>Descuento: 15%</p>
                                                <p>Usos: 23/100</p>
                                                <p>Expira: 31/03/2024</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-3 border border-slate-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm">NUEVOCLIENTE</span>
                                                <Badge variant="secondary">Pausado</Badge>
                                            </div>
                                            <div className="text-sm text-slate-600 space-y-1">
                                                <p>Descuento: $5.000</p>
                                                <p>Usos: 45/∞</p>
                                                <p>Expira: Sin límite</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Programa de Referidos */}
                            <Card className="neu-card">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Programa de Referidos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-900">147</div>
                                            <div className="text-sm text-slate-600">Referencias Activas</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-900">23</div>
                                            <div className="text-sm text-slate-600">Conversiones Este Mes</div>
                                        </div>
                                    </div>
                                    
                                    <Button variant="outline" className="w-full">
                                        <Users className="w-4 h-4 mr-2" />
                                        Gestionar Referidos
                                    </Button>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Tasa de conversión:</span>
                                            <span className="font-medium">15.6%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Recompensa promedio:</span>
                                            <span className="font-medium">$2.500</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">ROI del programa:</span>
                                            <span className="font-medium text-green-600">+245%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
