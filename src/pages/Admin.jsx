// Redirige al nuevo dashboard
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminRedirectPage() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate(createPageUrl('AdminDashboard'), { replace: true });
    }, [navigate]);
    
    return null; // O un spinner de carga
}