
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { User } from "@/api/entities";
import {
  Home,
  Plus,
  Edit,
  Eye,
  Calendar,
  DollarSign,
  BarChart, // TrendingUp was removed as it was unused
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isViewer, setIsViewer] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        setIsViewer(userData.user_type === 'viewer');

        const userProperties = await Property.filter({ owner_id: userData.id });
        setProperties(userProperties);
      } catch (error) {
        // Usa la función de login centralizada
        const { login } = await import('@/components/utils/auth');
        await login();
        return;
      }
      setLoading(false);
    };
    checkAuthAndLoadData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'activa':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activa</Badge>;
      case 'pausada':
        return <Badge variant="secondary">Pausada</Badge>;
      case 'pendiente_aprobacion':
        return <Badge variant="outline" className="bg-[var(--brand-yellow)] text-black">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const crumbs = [
    { label: 'Mi Cuenta', href: createPageUrl('MiCuenta') },
    { label: 'Mis Propiedades' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs crumbs={crumbs} />

      {isViewer && (
        <Alert variant="default" className="mb-8 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-800">Modo Solo Lectura</AlertTitle>
          <AlertDescription className="text-blue-700">
            Estás viendo esta página como "Viewer". Las acciones de edición y publicación están deshabilitadas.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Mis Propiedades
          </h1>
          <p className="text-xl text-slate-600">
            Gestiona tus propiedades y reservas.
          </p>
        </div>
        <Link to={createPageUrl("AddProperty")}>
          <Button className="neuro-button-primary" disabled={isViewer}>
            <Plus className="w-4 h-4 mr-2" />
            Publicar Anuncio
          </Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <Card className="neuro-card-inset p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No tienes propiedades publicadas
          </h3>
          <p className="text-slate-600 mb-6">
            Comienza a generar ingresos compartiendo tu espacio.
          </p>
          <Link to={createPageUrl("AddProperty")}>
            <Button className="neuro-button-primary" disabled={isViewer}>
                Publicar mi primera propiedad
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {properties.map(property => (
            <Card key={property.id} className="neuro-card-outset overflow-hidden">
              <div className="md:flex">
                <div className="md:w-64 aspect-[4/3] md:aspect-auto flex-shrink-0">
                  <img
                    src={property.images?.[0] || "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop"}
                    alt={`Imagen de portada de ${property.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                      <div className="text-sm text-slate-500">{property.location}</div>
                    </div>
                    {getStatusBadge(property.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>${property.price_per_night?.toLocaleString()} / noche</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{property.booking_count || 0} reservas</span>
                    </div>
                     <div className="flex items-center space-x-2">
                      <BarChart className="w-4 h-4 text-purple-600" />
                      <span>Ver estadísticas</span>
                    </div>
                  </div>

                  <div className="flex justify-end items-center space-x-3">
                    <Link to={createPageUrl("PropertyDetail") + `?id=${property.id}`}>
                      <Button variant="outline" size="sm" className="neuro-button">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Anuncio
                      </Button>
                    </Link>
                    <Link to={createPageUrl("AddProperty") + `?id=${property.id}`}>
                       <Button variant="outline" size="sm" className="neuro-button" disabled={isViewer}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar Anuncio
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
