import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminComentariosPage() {
    return (
        <AdminLayout requiredRole={["admin", "superadmin", "moderador"]}>
            <h1 className="text-3xl font-bold">Gestión de Comentarios y Reseñas</h1>
            <p className="mt-2 text-slate-600">Próximamente: Tabla de moderación de reseñas de la plataforma.</p>
        </AdminLayout>
    );
}