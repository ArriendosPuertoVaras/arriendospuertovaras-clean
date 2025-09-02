
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils'; // Corrected syntax here
import { toast } from 'sonner';

/**
 * AuthGuard es un componente del lado del cliente que protege una ruta.
 * Muestra un spinner mientras verifica la autenticación y redirige si falla.
 * Esto asegura que el contenido protegido no se muestre a usuarios no autenticados.
 * @param {object} props
 * @param {React.ReactNode} props.children - El contenido a renderizar si el usuario está autenticado.
 * @param {boolean} [props.adminOnly=false] - Si es true, requiere que el usuario sea administrador.
 * @param {boolean} [props.hostOnly=false] - Si es true, requiere que el usuario sea arrendador.
 */
export default function AuthGuard({ children, adminOnly = false, hostOnly = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await User.me();
        if (!user) throw new Error("Not authenticated");

        let hasPermission = true;
        if (adminOnly && user.role !== 'admin') {
          hasPermission = false;
          toast.error("Acceso restringido a administradores.");
          navigate(createPageUrl("Home"), { replace: true });
        } else if (hostOnly && user.user_type !== 'arrendador') {
          hasPermission = false;
          toast.error("Acceso restringido a anfitriones.");
          navigate(createPageUrl("Home"), { replace: true });
        }

        if (hasPermission) {
          setIsVerified(true);
        }
      } catch (error) {
        // Redirigir a MiCuenta, que funcionará como página de login, pasando la URL actual para volver.
        const nextPath = location.pathname + location.search;
        const loginUrl = `${createPageUrl('MiCuenta')}?next=${encodeURIComponent(nextPath)}`;
        navigate(loginUrl, { replace: true });
      }
    };

    checkAuth();
  }, [navigate, location, adminOnly, hostOnly]);

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Verificando tu acceso...</h2>
        <p className="text-slate-500">Un momento por favor.</p>
      </div>
    );
  }

  return <>{children}</>;
}
