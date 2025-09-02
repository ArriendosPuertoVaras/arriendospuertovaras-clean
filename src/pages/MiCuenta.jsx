
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User as UserIcon,
  CreditCard,
  Building2,
  Briefcase,
  BarChart2,
  LogOut,
  Shield,
  Loader2 // Importar Loader2
} from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { logout } from '@/components/utils/auth';

export default function MiCuentaPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Esta página está envuelta en AuthGuard, por lo que el usuario debe estar autenticado.
    // Solo necesitamos obtener los datos del usuario para mostrarlos.
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        // Redirección automática para administradores
        if (userData && (userData.role === 'admin' || userData.role === 'superadmin')) {
          navigate(createPageUrl("AdminDashboard"));
          return; // Detener ejecución para evitar que se muestre la página
        }
        setUser(userData);
      } catch (e) {
        // AuthGuard se encargará de la redirección si esto falla.
        console.error("Failed to fetch user in MiCuenta", e);
      }
    };
    fetchUser();
  }, [navigate]); // Added navigate to dependency array

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Has cerrado sesión correctamente.");
      navigate(createPageUrl("Home"));
    } catch (error) {
      toast.error("Error al cerrar sesión.");
    }
  };

  // Mostrar un loader mientras se verifica el rol y se redirige si es necesario
  if (!user) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600"/>
        </div>
      )
  }

  const navItems = [
    { href: createPageUrl("Profile"), icon: UserIcon, title: "Perfil y Pagos", desc: "Actualiza tus datos personales y bancarios." },
    { href: createPageUrl("MyBookings"), icon: Briefcase, title: "Mis Reservas", desc: "Revisa el historial de tus reservas." },
    ...(user?.user_type === 'arrendador' ? [
      { href: createPageUrl("MyProperties"), icon: Building2, title: "Mis Propiedades", desc: "Gestiona tus anuncios y calendarios." },
      { href: createPageUrl("Dashboard"), icon: BarChart2, title: "Dashboard de Ingresos", desc: "Analiza el rendimiento de tus propiedades." },
      { href: createPageUrl("MyServices"), icon: CreditCard, title: "Mis Servicios", desc: "Administra los servicios que ofreces." }
    ] : []),
    // The admin link is removed here because admins are now redirected away from this page.
    // However, if there was a case where an admin *could* access this page and see a link,
    // the original condition `...(user?.role === 'admin' ? [...] : [])` would still work.
    // Given the new redirection logic, this specific link here will likely never be seen by an admin.
  ];

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={user.profile_image} />
            <AvatarFallback>{user.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">¡Hola, {user.full_name}!</h1>
            <p className="text-xl text-slate-600 mt-1">Bienvenido a tu panel de control.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navItems.map((item) => (
            <Link to={item.href} key={item.title}>
              <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <item.icon className="w-6 h-6 text-blue-600" />
                    <span>{item.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.desc}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
}
