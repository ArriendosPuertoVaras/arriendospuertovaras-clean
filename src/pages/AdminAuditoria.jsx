import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminAuditoriaPage() {
    return (
        <AdminLayout requiredRole={["superadmin"]}>
            <h1 className="text-3xl font-bold">Registro de Auditoría</h1>
            <p className="mt-2 text-slate-600">Próximamente: Log de acciones críticas realizadas por administradores.</p>
        </AdminLayout>
    );
}