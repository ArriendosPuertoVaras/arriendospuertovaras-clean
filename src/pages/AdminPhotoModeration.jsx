import React, { useState, useEffect } from 'react';
import { Photo } from '@/api/entities';
import { Property } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AdminPhotoModerationPage() {
  const [photos, setPhotos] = useState([]);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const allPhotos = await Photo.list();
      const allProperties = await Property.list();
      
      const propertiesMap = {};
      allProperties.forEach(prop => {
        propertiesMap[prop.id] = prop;
      });
      
      setPhotos(allPhotos);
      setProperties(propertiesMap);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Error al cargar las fotos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (photoId, newStatus) => {
    try {
      setActionLoading(photoId);
      await Photo.update(photoId, { 
        status: newStatus,
        safe_search: {
          ...photos.find(p => p.id === photoId)?.safe_search,
          manual_review_at: new Date().toISOString(),
          manual_status: newStatus
        }
      });
      
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, status: newStatus }
          : photo
      ));
      
      toast.success(`Foto ${newStatus === 'approved' ? 'aprobada' : 'rechazada'}`);
    } catch (error) {
      console.error('Error updating photo status:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setActionLoading(null);
    }
  };

  const filterPhotos = (status) => {
    return photos.filter(photo => photo.status === status);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (photo) => {
    const isStub = photo.safe_search?.stub;
    const status = photo.status;
    
    if (isStub && status === 'approved') {
      return <Badge variant="secondary">Auto-aprobada (Stub)</Badge>;
    }
    
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-100 text-green-800">Aprobada</Badge>;
      case 'rejected': return <Badge variant="destructive">Rechazada</Badge>;
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const PhotoCard = ({ photo }) => {
    const property = properties[photo.listing_id];
    const imageUrl = photo.variants?.md?.url || photo.variants?.sm?.url || '';
    
    return (
      <Card key={photo.id} className="overflow-hidden">
        <div className="aspect-video bg-gray-100 relative">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={`Foto de ${property?.title || 'Propiedad'}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Eye className="w-8 h-8" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            {getStatusBadge(photo)}
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium truncate">
                {property?.title || `Propiedad ${photo.listing_id}`}
              </h4>
              {getStatusIcon(photo.status)}
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Archivo: {photo.original_name}</p>
              <p>Subida: {new Date(photo.created_date).toLocaleDateString()}</p>
              {photo.safe_search?.moderated_at && (
                <p>Moderada: {new Date(photo.safe_search.moderated_at).toLocaleDateString()}</p>
              )}
            </div>
            
            {photo.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={() => handleStatusChange(photo.id, 'approved')}
                  disabled={actionLoading === photo.id}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Aprobar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleStatusChange(photo.id, 'rejected')}
                  disabled={actionLoading === photo.id}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Rechazar
                </Button>
              </div>
            )}
            
            {photo.status === 'rejected' && (
              <Button 
                size="sm" 
                onClick={() => handleStatusChange(photo.id, 'approved')}
                disabled={actionLoading === photo.id}
                className="w-full mt-3"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Restaurar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <AdminAuthGuard requiredRole="admin">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminAuthGuard>
    );
  }

  const pendingPhotos = filterPhotos('pending');
  const approvedPhotos = filterPhotos('approved');
  const rejectedPhotos = filterPhotos('rejected');

  return (
    <AdminAuthGuard requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Moderación de Fotos
          </h1>
          <p className="text-gray-600">
            Gestiona las fotos subidas por los usuarios
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              Pendientes
              {pendingPhotos.length > 0 && (
                <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                  {pendingPhotos.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprobadas ({approvedPhotos.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rechazadas ({rejectedPhotos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingPhotos.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No hay fotos pendientes
                </h3>
                <p className="text-gray-600">
                  Todas las fotos han sido revisadas
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pendingPhotos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {approvedPhotos.map(photo => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rejectedPhotos.map(photo => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthGuard>
  );
}