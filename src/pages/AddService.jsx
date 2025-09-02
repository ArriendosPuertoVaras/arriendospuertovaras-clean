
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Service } from "@/api/entities";
import { User } from "@/api/entities";
import { ServiceCategory } from "@/api/entities";
import { login as authLogin } from "@/components/utils/auth";
import { UploadFile } from "@/api/integrations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Wrench, Upload, Save } from "lucide-react";
import BackButton from '@/components/ui/BackButton';

export default function AddServicePage() {
    const navigate = useNavigate();
    const [offering, setOffering] = useState({
        title: '',
        type: 'servicio',
        description: '',
        category: '',
        subcategory: '', // Nueva subcategoría
        pricing_model: 'por_hora',
        price_per_hour: '',
        price_per_day: '',
        price_per_person: '',
        location_coverage: '',
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
            } catch (error) {
                await authLogin();
            }
        };
        checkUser();
    }, []);

    // Cargar categorías principales al montar el componente
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                // Cargar todas las categorías activas sin parent_category_slug (categorías principales)
                const allCategories = await ServiceCategory.filter({ active: true });
                const parentCategories = allCategories.filter(cat => !cat.parent_category_slug);
                setCategories(parentCategories);
            } catch (error) {
                toast.error("Error al cargar las categorías.");
                console.error(error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Cargar subcategorías cuando se selecciona una categoría principal
    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!offering.category) {
                setSubcategories([]);
                return;
            }
            try {
                const allCategories = await ServiceCategory.filter({ 
                    active: true,
                    parent_category_slug: offering.category
                });
                setSubcategories(allCategories);
            } catch (error) {
                console.error("Error loading subcategories:", error);
                setSubcategories([]);
            }
        };
        fetchSubcategories();
    }, [offering.category]);

    const handleInputChange = (field, value) => {
        setOffering(prev => ({ ...prev, [field]: value }));
        // Reset subcategory if category changes
        if (field === 'category') {
            setOffering(prev => ({ ...prev, subcategory: '' }));
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setLoading(true);
        toast.info("Subiendo imágenes...");
        try {
            const uploadedUrls = await Promise.all(files.map(file => UploadFile({ file })));
            setOffering(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls.map(u => u.file_url)] }));
            toast.success("Imágenes subidas.");
        } catch (error) {
            toast.error("Error al subir imágenes.");
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Debes iniciar sesión para publicar.");
            return;
        }
        setLoading(true);
        try {
            const dataToSave = {
                ...offering,
                provider_id: user.id,
                // Usar la subcategoría si está seleccionada, sino la categoría principal
                category: offering.subcategory || offering.category,
                price_per_hour: offering.pricing_model === 'por_hora' ? Number(offering.price_per_hour) : null,
                price_per_day: offering.pricing_model === 'por_dia' ? Number(offering.price_per_day) : null,
                price_per_person: offering.pricing_model === 'por_persona' ? Number(offering.price_per_person) : null,
            };
            await Service.create(dataToSave);
            toast.success("Publicación creada exitosamente.");
            navigate(createPageUrl("Services"));
        } catch (error) {
            console.error(error);
            toast.error("Error al crear la publicación.");
        }
        setLoading(false);
    };

    const currentPriceField = {
        'por_hora': { label: 'Precio por Hora', field: 'price_per_hour' },
        'por_dia': { label: 'Precio por Día', field: 'price_per_day' },
        'por_persona': { label: 'Precio por Persona', field: 'price_per_person' }
    }[offering.pricing_model];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                        Ofrecer un Servicio
                    </h1>
                    <p className="text-xl text-slate-600 mt-2">
                        Comparte tu talento y genera ingresos en Puerto Varas
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles de tu Servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título del Servicio</Label>
                            <Input 
                                id="title" 
                                placeholder="Ej: Limpieza profunda de departamentos"
                                value={offering.title} 
                                onChange={e => handleInputChange('title', e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría Principal</Label>
                            <Select 
                                value={offering.category} 
                                onValueChange={value => handleInputChange('category', value)} 
                                required 
                                disabled={loadingCategories}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingCategories ? "Cargando..." : "Selecciona una categoría..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.slug} value={cat.slug}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Subcategoría (solo si hay una categoría seleccionada) */}
                        {offering.category && subcategories.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="subcategory">Especialidad (Opcional)</Label>
                                <Select 
                                    value={offering.subcategory} 
                                    onValueChange={value => handleInputChange('subcategory', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una especialidad..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subcategories.map(sub => (
                                            <SelectItem key={sub.slug} value={sub.slug}>
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="description">Descripción Detallada</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Describe tu servicio, experiencia, métodos de trabajo..."
                                value={offering.description} 
                                onChange={e => handleInputChange('description', e.target.value)} 
                                required 
                                rows={5} 
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Precio y Cobertura</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Modelo de Precio</Label>
                            <Select value={offering.pricing_model} onValueChange={value => handleInputChange('pricing_model', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="por_hora">Por Hora</SelectItem>
                                    <SelectItem value="por_dia">Por Día</SelectItem>
                                    <SelectItem value="por_persona">Por Persona</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={currentPriceField.field}>{currentPriceField.label}</Label>
                            <Input
                                id={currentPriceField.field}
                                type="number"
                                placeholder="Ej: 15000"
                                value={offering[currentPriceField.field]}
                                onChange={e => handleInputChange(currentPriceField.field, e.target.value)}
                                required
                                min="0"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="location_coverage">Área de Cobertura</Label>
                            <Input
                                id="location_coverage"
                                placeholder="Ej: Puerto Varas, Frutillar, Puerto Montt"
                                value={offering.location_coverage}
                                onChange={e => handleInputChange('location_coverage', e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Imágenes de tu Trabajo</CardTitle></CardHeader>
                    <CardContent>
                        <Label htmlFor="image-upload" className="cursor-pointer">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50">
                                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                <span className="text-blue-600 font-medium">Subir imágenes</span>
                                <p className="text-sm text-slate-500 mt-1">Muestra ejemplos de tu trabajo</p>
                            </div>
                        </Label>
                        <Input id="image-upload" type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-4">
                            {offering.images.map((url, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img src={url} alt={`Imagen ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={loading} className="btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Guardando..." : "Publicar Servicio"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
