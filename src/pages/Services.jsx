
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Service } from "@/api/entities";
import {
    Search,
    TreePine,
    Sparkles,
    Briefcase,
    Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ServicesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const urlParams = new URLSearchParams(location.search);
    const initialType = urlParams.get('type') || 'all';
    const categoryFilter = urlParams.get('category'); // Nuevo: filtro por categoría

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(initialType);
    
    useEffect(() => {
        const loadServices = async () => {
            setLoading(true);
            try {
                let filter = {};
                
                // Filtrar por tipo si no es "all"
                if (activeTab !== 'all') {
                    filter.type = activeTab;
                }
                
                // Filtrar por categoría específica si se proporciona
                if (categoryFilter) {
                    // Para el caso de vehículos, podemos filtrar por una categoría de transporte
                    if (categoryFilter === 'transporte') {
                        filter.category = 'transporte'; // Asumiendo que existe esta categoría en tus servicios
                    }
                }
                
                const data = await Service.filter(filter);
                setServices(data);
            } catch (error) {
                console.error("Error loading services:", error);
            }
            setLoading(false);
        };

        loadServices();
    }, [activeTab, categoryFilter]);

    const handleTabChange = (value) => {
        setActiveTab(value);
        // Construir nueva URL manteniendo el filtro de categoría si existe
        let newUrl = createPageUrl("Services");
        const params = new URLSearchParams();
        
        if (value !== 'all') {
            params.set('type', value);
        }
        
        if (categoryFilter) {
            params.set('category', categoryFilter);
        }
        
        if (params.toString()) {
            newUrl += '?' + params.toString();
        }
        
        navigate(newUrl, { replace: true });
    };

    const getPriceDisplay = (service) => {
        switch (service.pricing_model) {
            case 'por_hora': return `$${service.price_per_hour?.toLocaleString()} / hora`;
            case 'por_dia': return `$${service.price_per_day?.toLocaleString()} / día`;
            case 'por_persona': return `$${service.price_per_person?.toLocaleString()} / persona`;
            default: return 'Consultar precio';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    // Determinar el ícono y título basado en filtros activos
    let PageIcon = Briefcase;
    let pageTitle = 'Servicios y Experiencias';
    let pageDescription = 'Explora todo lo que Puerto Varas tiene para ofrecer';
    
    if (categoryFilter === 'transporte') {
        PageIcon = Car;
        pageTitle = 'Vehículos y Transporte';
        pageDescription = 'Encuentra opciones de transporte y vehículos de alquiler';
    } else if (activeTab === 'servicio') {
        PageIcon = TreePine;
        pageTitle = 'Servicios';
        pageDescription = 'Encuentra ayuda experta para tus necesidades';
    } else if (activeTab === 'experiencia') {
        PageIcon = Sparkles;
        pageTitle = 'Experiencias';
        pageDescription = 'Descubre actividades y aventuras únicas';
    }

    return (
        <div className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <Link to={createPageUrl("ServicesHub")} className="inline-block mb-6">
                        <Button variant="outline">← Ver catálogo completo de servicios profesionales</Button>
                    </Link>
                    
                    <PageIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                       Explora {pageTitle}
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        {pageDescription}
                    </p>
                </div>
                
                <Tabs defaultValue={initialType} onValueChange={handleTabChange} className="w-full mb-8">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="servicio">Servicios</TabsTrigger>
                        <TabsTrigger value="experiencia">Experiencias</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map(service => (
                        <Card key={service.id} className="card-hover overflow-hidden border-0 shadow-lg">
                            <div className="aspect-[4/3] relative overflow-hidden">
                                <img
                                    src={service.images?.[0] || "https://images.unsplash.com/photo-1521791136064-7986c28e7481?w=400&h=300&fit=crop"}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-white/90 text-slate-800 backdrop-blur-sm capitalize">
                                        {service.type}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 mb-2">
                                    {service.title}
                                </h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                                    {service.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-slate-900">
                                        {getPriceDisplay(service)}
                                    </span>
                                    <Button size="sm">Ver más</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {services.length === 0 && (
                    <Card className="p-12 text-center col-span-full">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            No se encontraron resultados
                        </h3>
                        <p className="text-slate-600">
                            No hay publicaciones en esta categoría por el momento.
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}
