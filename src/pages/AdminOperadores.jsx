import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminOperadoresPage() {
    return (
        <AdminLayout requiredRole={["admin", "superadmin"]}>
            <h1 className="text-3xl font-bold">Gestión de Operadores</h1>
            <p className="mt-2 text-slate-600">Próximamente: Tabla de operadores, perfiles y gestión de liquidaciones.</p>
        </AdminLayout>
    );
}