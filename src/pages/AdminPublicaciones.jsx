import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Property } from '@/api/entities';
import { Service } from '@/api/entities';
import { BlogPost } from '@/api/entities';
import { User } from '@/api/entities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import PublicationTable from '@/components/admin/PublicationTable';

const PUBLICATION_TYPES = {
    PROPERTIES: 'properties',
    SERVICES: 'services',
    BLOG: 'blog',
};

export default function AdminPublicacionesPage() {
    const [publications, setPublications] = useState({
        [PUBLICATION_TYPES.PROPERTIES]: [],
        [PUBLICATION_TYPES.SERVICES]: [],
        [PUBLICATION_TYPES.BLOG]: [],
    });
    const [users, setUsers] = useState(new Map());
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [properties, services, blogPosts, userList] = await Promise.all([
                Property.list(),
                Service.list(),
                BlogPost.list(),
                User.list(),
            ]);

            const userMap = new Map(userList.map(u => [u.id, u.full_name || u.email]));
            setUsers(userMap);

            setPublications({
                [PUBLICATION_TYPES.PROPERTIES]: properties,
                [PUBLICATION_TYPES.SERVICES]: services,
                [PUBLICATION_TYPES.BLOG]: blogPosts,
            });

        } catch (error) {
            console.error("Error fetching publications:", error);
            toast.error("Error al cargar las publicaciones.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (entity, id, newStatus) => {
        toast.info(`Actualizando estado a "${newStatus}"...`);
        try {
            if (entity === PUBLICATION_TYPES.PROPERTIES) {
                await Property.update(id, { status: newStatus });
            } else if (entity === PUBLICATION_TYPES.SERVICES) {
                await Service.update(id, { status: newStatus });
            } else if (entity === PUBLICATION_TYPES.BLOG) {
                await BlogPost.update(id, { status: newStatus });
            }
            toast.success("Estado actualizado correctamente.");
            fetchData(); // Recargar datos
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("No se pudo actualizar el estado.");
        }
    };

    const propertyColumns = [
        { header: 'Título', accessor: 'title' },
        { header: 'Propietario', accessor: 'owner_id' },
        { header: 'Categoría', accessor: 'category' },
        { header: 'Estado', accessor: 'status' },
        { header: 'Fecha Creación', accessor: 'created_date' },
    ];

    const serviceColumns = [
        { header: 'Título', accessor: 'title' },
        { header: 'Proveedor', accessor: 'provider_id' },
        { header: 'Tipo', accessor: 'type' },
        { header: 'Estado', accessor: 'status' },
        { header: 'Fecha Creación', accessor: 'created_date' },
    ];
    
    const blogColumns = [
        { header: 'Título', accessor: 'title' },
        { header: 'Autor', accessor: 'author_id' },
        { header: 'Categoría', accessor: 'category' },
        { header: 'Estado', accessor: 'status' },
        { header: 'Fecha Creación', accessor: 'created_date' },
    ];

    return (
        <AdminLayout requiredRole={["admin", "superadmin", "moderador"]}>
            <h1 className="text-3xl font-bold">Moderación de Publicaciones</h1>
            <p className="mt-2 text-slate-600 mb-6">Gestiona y modera todas las publicaciones de la plataforma.</p>

            <Tabs defaultValue={PUBLICATION_TYPES.PROPERTIES} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value={PUBLICATION_TYPES.PROPERTIES}>Propiedades</TabsTrigger>
                    <TabsTrigger value={PUBLICATION_TYPES.SERVICES}>Servicios y Experiencias</TabsTrigger>
                    <TabsTrigger value={PUBLICATION_TYPES.BLOG}>Blog</TabsTrigger>
                </TabsList>
                
                <TabsContent value={PUBLICATION_TYPES.PROPERTIES}>
                    <PublicationTable
                        data={publications[PUBLICATION_TYPES.PROPERTIES]}
                        columns={propertyColumns}
                        loading={loading}
                        users={users}
                        entityType={PUBLICATION_TYPES.PROPERTIES}
                        onStatusChange={handleStatusChange}
                        statusOptions={{
                            activa: { label: 'Activa' },
                            pausada: { label: 'Pausada' },
                            pendiente_aprobacion: { label: 'Pendiente' },
                            rechazada: { label: 'Rechazada' },
                        }}
                    />
                </TabsContent>

                <TabsContent value={PUBLICATION_TYPES.SERVICES}>
                    <PublicationTable
                        data={publications[PUBLICATION_TYPES.SERVICES]}
                        columns={serviceColumns}
                        loading={loading}
                        users={users}
                        entityType={PUBLICATION_TYPES.SERVICES}
                        onStatusChange={handleStatusChange}
                        statusOptions={{
                            activo: { label: 'Activo' },
                            pausado: { label: 'Pausado' },
                            pendiente_aprobacion: { label: 'Pendiente' },
                            rechazado: { label: 'Rechazado' },
                        }}
                    />
                </TabsContent>

                 <TabsContent value={PUBLICATION_TYPES.BLOG}>
                    <PublicationTable
                        data={publications[PUBLICATION_TYPES.BLOG]}
                        columns={blogColumns}
                        loading={loading}
                        users={users}
                        entityType={PUBLICATION_TYPES.BLOG}
                        onStatusChange={handleStatusChange}
                         statusOptions={{
                            published: { label: 'Publicado' },
                            draft: { label: 'Borrador' },
                            scheduled: { label: 'Programado' },
                            archived: { label: 'Archivado' },
                        }}
                    />
                </TabsContent>
            </Tabs>

        </AdminLayout>
    );
}