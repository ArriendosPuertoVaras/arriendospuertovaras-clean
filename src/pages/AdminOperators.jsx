import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { Property } from '@/api/entities';
import { Service } from '@/api/entities';
import AdminLayout from '@/components/admin/AdminLayout';
import BackButton from '@/components/ui/BackButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Eye, Edit, CheckCircle, XCircle, AlertTriangle, Link as LinkIcon, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allProperties, allServices] = await Promise.all([
        User.list(),
        Property.list(),
        Service.list()
      ]);

      const operatorMap = new Map();

      allProperties.forEach(property => {
        if (!operatorMap.has(property.owner_id)) {
          operatorMap.set(property.owner_id, { properties: [], services: [] });
        }
        operatorMap.get(property.owner_id).properties.push(property);
      });

      allServices.forEach(service => {
        if (!operatorMap.has(service.provider_id)) {
          operatorMap.set(service.provider_id, { properties: [], services: [] });
        }
        operatorMap.get(service.provider_id).services.push(service);
      });
      
      const operatorDetails = allUsers
        .filter(user => operatorMap.has(user.id))
        .map(user => ({
          ...user,
          ...operatorMap.get(user.id)
        }));

      setOperators(operatorDetails);
    } catch (error) {
      console.error("Error loading operator data:", error);
      toast.error("Error al cargar los datos de los operadores.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (entityType, id, newStatus) => {
    setActionLoading(true);
    try {
      if (entityType === 'property') {
        await Property.update(id, { status: newStatus });
      } else {
        await Service.update(id, { status: newStatus });
      }
      toast.success(`Estado de la publicación actualizado a "${newStatus}".`);
      await loadData(); // Recargar datos para reflejar el cambio
    } catch (error) {
      toast.error("Error al actualizar el estado.");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };
  
  const openDeleteDialog = (entityType, item) => {
    setItemToDelete({ type: entityType, data: item });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    
    try {
      if (itemToDelete.type === 'property') {
        await Property.delete(itemToDelete.data.id);
      } else {
        await Service.delete(itemToDelete.data.id);
      }
      toast.success("La publicación ha sido eliminada.");
      await loadData();
    } catch (error) {
      toast.error("Error al eliminar la publicación.");
      console.error(error);
    } finally {
      setActionLoading(false);
      setDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'activa':
      case 'activo':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Activa</Badge>;
      case 'pausada':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><AlertTriangle className="w-3 h-3 mr-1" />Pausada</Badge>;
      case 'pendiente_aprobacion':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'rechazada':
      case 'rechazado':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rechazada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const IcalStatus = ({ url }) => {
    if (url) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800"><LinkIcon className="w-3 h-3 mr-1" />Configurado</Badge>;
    }
    return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />No</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Operadores y Publicaciones</h1>
          <p className="text-slate-600">Gestiona los operadores y sus anuncios en la plataforma.</p>
        </div>
      </div>

      <div className="space-y-8">
        {operators.map(operator => (
          <Card key={operator.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        {operator.full_name}
                      </CardTitle>
                      <CardDescription>{operator.email}</CardDescription>
                  </div>
                  <Badge variant="outline">{operator.user_type === 'arrendador' ? 'Operador' : 'Usuario'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="properties">
                <TabsList>
                  <TabsTrigger value="properties">Propiedades ({operator.properties.length})</TabsTrigger>
                  <TabsTrigger value="services">Servicios ({operator.services.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="properties">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>iCal Airbnb</TableHead>
                        <TableHead>iCal Booking</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operator.properties.map(property => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.title}</TableCell>
                          <TableCell>{getStatusBadge(property.status)}</TableCell>
                          <TableCell><IcalStatus url={property.ical_import_url_airbnb} /></TableCell>
                          <TableCell><IcalStatus url={property.ical_import_url_booking} /></TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Gestionar</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleStatusChange('property', property.id, 'activa')}>Aprobar y Activar</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusChange('property', property.id, 'pausada')}>Pausar</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusChange('property', property.id, 'rechazada')}>Rechazar</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild><Link to={createPageUrl("PropertyDetail") + `?id=${property.id}`} target="_blank" className="flex items-center w-full"><Eye className="w-4 h-4 mr-2" />Ver Anuncio</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link to={createPageUrl("AddProperty") + `?id=${property.id}`} target="_blank" className="flex items-center w-full"><Edit className="w-4 h-4 mr-2" />Editar</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => openDeleteDialog('property', property)} className="text-red-600 focus:text-red-600 focus:bg-red-50"><Trash2 className="w-4 h-4 mr-2" />Eliminar</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {operator.properties.length === 0 && <p className="text-center text-slate-500 py-4">Este operador no tiene propiedades.</p>}
                </TabsContent>
                <TabsContent value="services">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operator.services.map(service => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.title}</TableCell>
                          <TableCell>{getStatusBadge(service.status)}</TableCell>
                          <TableCell><Badge variant="secondary">{service.type}</Badge></TableCell>
                          <TableCell>{service.category}</TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Gestionar</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleStatusChange('service', service.id, 'activo')}>Aprobar y Activar</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusChange('service', service.id, 'pausado')}>Pausar</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleStatusChange('service', service.id, 'rechazado')}>Rechazar</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild><Link to={createPageUrl("ServiceDetail") + `?id=${service.id}`} target="_blank" className="flex items-center w-full"><Eye className="w-4 h-4 mr-2" />Ver Anuncio</Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link to={createPageUrl("AddService") + `?id=${service.id}`} target="_blank" className="flex items-center w-full"><Edit className="w-4 h-4 mr-2" />Editar</Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => openDeleteDialog('service', service)} className="text-red-600 focus:text-red-600 focus:bg-red-50"><Trash2 className="w-4 h-4 mr-2" />Eliminar</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {operator.services.length === 0 && <p className="text-center text-slate-500 py-4">Este operador no tiene servicios.</p>}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
        {operators.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">No se encontraron operadores con publicaciones activas.</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará permanentemente la publicación
              <span className="font-bold"> "{itemToDelete?.data.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AdminLayout>
  );
}