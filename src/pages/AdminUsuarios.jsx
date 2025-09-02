import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminUsuariosPage() {
    return (
        <AdminLayout requiredRole={["admin", "superadmin"]}>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="mt-2 text-slate-600">Próximamente: Tabla de usuarios registrados con acciones de gestión.</p>
        </AdminLayout>
    );
}