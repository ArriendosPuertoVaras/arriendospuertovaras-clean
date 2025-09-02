import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSoporteErroresPage() {
    return (
        <AdminLayout requiredRole={["admin", "superadmin"]}>
            <h1 className="text-3xl font-bold">Soporte y Errores</h1>
            <p className="mt-2 text-slate-600">Próximamente: Sistema de tickets, logs de errores y health checks.</p>
        </AdminLayout>
    );
}