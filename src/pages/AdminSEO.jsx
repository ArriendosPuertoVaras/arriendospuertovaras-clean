import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminSEOPage() {
    return (
        <AdminLayout requiredRole={["admin", "superadmin", "editor"]}>
            <h1 className="text-3xl font-bold">SEO & Marketing</h1>
            <p className="mt-2 text-slate-600">Próximamente: Gestión de metadatos, sitemaps, cupones y programa de referidos.</p>
        </AdminLayout>
    );
}