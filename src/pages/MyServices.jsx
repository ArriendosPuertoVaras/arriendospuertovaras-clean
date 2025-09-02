
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Service } from "@/api/entities";
import { User } from "@/api/entities";
import { Plus, Edit, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BackButton from "@/components/ui/BackButton";

export default function MyServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                const userServices = await Service.filter({ provider_id: userData.id });
                setServices(userServices);
            } catch (error) {
                // If the user is not authenticated, redirect to login
                // and then back to this page after successful login.
                await User.loginWithRedirect(createPageUrl('MyServices'));
            }
            setLoading(false);
        };
        checkAuthAndLoadData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }
    
    const crumbs = [
        { label: 'Mi Cuenta', href: createPageUrl('MiCuenta') },
        { label: 'Mis Servicios' }
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div className="flex-1">
                    <Breadcrumbs crumbs={crumbs} />
                </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Mis Servicios y Experiencias
                    </h1>
                    <p className="text-xl text-slate-600">
                        Gestiona tus servicios publicados.
                    </p>
                </div>
                <Link to={createPageUrl("AddService")}>
                    <Button className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Publicar Nuevo
                    </Button>
                </Link>
            </div>

            {services.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        No tienes servicios o experiencias publicadas
                    </h3>
                    <p className="text-slate-600 mb-6">
                        Comienza a generar ingresos compartiendo tus habilidades.
                    </p>
                    <Link to={createPageUrl("AddService")}>
                        <Button className="btn-primary">Ofrecer mi primer servicio</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-6">
                    {services.map(service => (
                         <Card key={service.id} className="overflow-hidden">
                             <div className="p-6 flex justify-between items-center">
                                 <div>
                                     <h3 className="text-xl font-semibold">{service.title}</h3>
                                     <Badge className="capitalize mt-2">{service.type}</Badge>
                                 </div>
                                 <div>
                                    <Link to={createPageUrl("AddService") + `?id=${service.id}`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4 mr-1" />
                                            Editar
                                        </Button>
                                    </Link>
                                 </div>
                             </div>
                         </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
