import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function AdminAuthGuard({ children, requiredRole = ["admin", "superadmin"] }) {
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState('verifying');
    const [verifiedUser, setVerifiedUser] = useState(null);

    useEffect(() => {
        const checkAuthAndRole = async () => {
            try {
                const user = await User.me();
                
                if (!user) {
                    throw new Error("No autenticado");
                }

                const userRole = user.role || 'user';
                
                const hasPermission = Array.isArray(requiredRole) 
                    ? requiredRole.includes(userRole)
                    : userRole === requiredRole;

                if (!hasPermission) {
                    console.warn('Acceso denegado. Rol del usuario:', userRole, 'Roles permitidos:', requiredRole);
                    toast.error("No tienes permisos para acceder a esta sección.");
                    navigate(createPageUrl("Home"));
                    return;
                }

                setVerifiedUser(user);
                setVerificationStatus('success');
            } catch (error) {
                console.error('Error en AdminAuthGuard:', error);
                toast.error("Acceso denegado. Por favor, inicia sesión como administrador.");
                navigate(createPageUrl("MiCuenta"));
            }
        };

        checkAuthAndRole();
    }, [navigate, requiredRole]);

    if (verificationStatus === 'verifying') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-700">Verificando Acceso de Administrador...</h2>
                <p className="text-sm text-slate-500 mt-2">Validando permisos y cargando dashboard</p>
            </div>
        );
    }

    if (verificationStatus === 'success' && verifiedUser) {
        return <>{typeof children === 'function' ? children(verifiedUser) : children}</>;
    }

    return null;
}