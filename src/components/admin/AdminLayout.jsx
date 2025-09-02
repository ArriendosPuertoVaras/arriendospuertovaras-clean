
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

const ADMIN_TABS = [
  { label: "Dashboard", href: "AdminDashboard", roles: ["superadmin", "admin", "editor", "moderador", "finanzas_viewer"] },
  { label: "Usuarios", href: "AdminUsuarios", roles: ["superadmin", "admin"] },
  { label: "Publicaciones", href: "AdminPublicaciones", roles: ["superadmin", "admin", "editor", "moderador"] },
  { label: "Finanzas", href: "AdminFinanzas", roles: ["superadmin", "admin", "finanzas_viewer"] },
  { label: "Comentarios", href: "AdminComentarios", roles: ["superadmin", "admin", "moderador"] },
  { label: "Operadores", href: "AdminOperadores", roles: ["superadmin", "admin"] },
  { label: "Configuración", href: "AdminConfiguracion", roles: ["superadmin", "admin"] },
  { label: "Seguridad", href: "AdminSecurity", roles: ["superadmin", "admin"] }, // New tab for Security
  { label: "SEO & Marketing", href: "AdminSEOMarketing", roles: ["superadmin", "admin", "editor"] },
  { label: "Soporte & Errores", href: "AdminSoporteErrores", roles: ["superadmin", "admin"] },
  { label: "Auditoría", href: "AdminAuditoria", roles: ["superadmin", "admin"] }
];

export default function AdminLayout({ children, requiredRole = ["admin", "superadmin"] }) {
  const location = useLocation();
  
  return (
    <AdminAuthGuard requiredRole={requiredRole}>
      {(user) => (
        <div className="min-h-screen flex flex-col bg-manto">
          <main className="flex-1 p-6 lg:p-8">
            {/* Tabs de navegación (ARRIBA) */}
            <nav className="w-full mb-6 overflow-x-auto">
              <ul className="flex gap-2 min-w-max">
                {ADMIN_TABS
                  .filter(tab => tab.roles.includes(user.role))
                  .map(tab => {
                    const isActive = location.pathname === createPageUrl(tab.href) || 
                                   (tab.href === "AdminDashboard" && location.pathname === createPageUrl("AdminDashboard"));
                    
                    return (
                      <li key={tab.href}>
                        <Link
                          to={createPageUrl(tab.href)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive 
                              ? "bg-purple-600 text-white shadow-md" 
                              : "btn-neu text-slate-700 hover:text-purple-700"
                          }`}
                        >
                          {tab.label}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </nav>

            {/* Panel grande (ABAJO) */}
            <section className="neu-card p-6 min-h-[520px] bg-white">
              {children}
            </section>
          </main>
        </div>
      )}
    </AdminAuthGuard>
  );
}
