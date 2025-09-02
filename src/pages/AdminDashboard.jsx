import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import KpiCard from '@/components/admin/KpiCard';
import AlertCard from '@/components/admin/AlertCard';
import SalesChart from '@/components/admin/SalesChart';
import { DollarSign, Percent, FileText, TrendingUp, FileWarning, MessageSquareWarning, ShieldAlert, Search } from 'lucide-react';
import { calcularComision, calcularIVA, formatearCLP } from '@/components/utils/finanzas';

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState({
        ventasTotales: 117850,
        comisionPlataforma: 0,
        ivaGenerado: 0,
        pagadoOperadores: 100000,
        publicacionesPendientes: 20,
        ticketsSoporte: 10,
        erroresCriticos24h: 2,
        problemasSEO: 5,
        ventasVsComision7dias: []
    });

    const loadDashboardMetrics = async () => {
        try {
            // TODO: Implementar carga de métricas reales
            // const bookings = await Booking.filter({...});
            // const properties = await Property.filter({status: 'pendiente_aprobacion'});
            // etc.
        } catch (error) {
            console.error('Error loading dashboard metrics:', error);
        }
    };

    useEffect(() => {
        // Calcular métricas financieras basadas en las fórmulas chilenas
        const comision = calcularComision(dashboardData.ventasTotales);
        const iva = calcularIVA(comision);
        
        setDashboardData(prev => ({
            ...prev,
            comisionPlataforma: comision,
            ivaGenerado: iva
        }));

        // Cargar datos reales desde las entidades
        loadDashboardMetrics();
    }, [dashboardData.ventasTotales]);

    return (
        <AdminLayout>
            {/* KPIs Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <div className="neu-card p-5">
                    <KpiCard 
                        title="Ventas Totales" 
                        value={formatearCLP(dashboardData.ventasTotales)} 
                        icon={DollarSign}
                        trend="+12.5%"
                        trendUp={true}
                    />
                </div>
                <div className="neu-card p-5">
                    <KpiCard 
                        title="Comisión Plataforma" 
                        value={formatearCLP(dashboardData.comisionPlataforma)} 
                        icon={Percent}
                        subtitle="15% de ventas"
                    />
                </div>
                <div className="neu-card p-5">
                    <KpiCard 
                        title="IVA Generado" 
                        value={formatearCLP(dashboardData.ivaGenerado)} 
                        icon={FileText}
                        subtitle="19% de comisión"
                    />
                </div>
                <div className="neu-card p-5">
                    <KpiCard 
                        title="Pagado a Operadores" 
                        value={formatearCLP(dashboardData.pagadoOperadores)} 
                        icon={TrendingUp}
                        trend="+8.2%"
                        trendUp={true}
                    />
                </div>
            </div>

            {/* Alertas y Notificaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <div className="neu-card p-4">
                    <AlertCard 
                        title="Publicaciones Pendientes" 
                        value={dashboardData.publicacionesPendientes} 
                        tone="warning"
                        icon={FileWarning}
                        actionText="Revisar"
                    />
                </div>
                <div className="neu-card p-4">
                    <AlertCard 
                        title="Tickets de Soporte" 
                        value={dashboardData.ticketsSoporte} 
                        tone="info"
                        icon={MessageSquareWarning}
                        actionText="Gestionar"
                    />
                </div>
                <div className="neu-card p-4">
                    <AlertCard 
                        title="Errores Críticos (24h)" 
                        value={dashboardData.erroresCriticos24h} 
                        tone="danger"
                        icon={ShieldAlert}
                        actionText="Investigar"
                    />
                </div>
                <div className="neu-card p-4">
                    <AlertCard 
                        title="Problemas SEO" 
                        value={dashboardData.problemasSEO} 
                        tone="violet"
                        icon={Search}
                        actionText="Optimizar"
                    />
                </div>
            </div>

            {/* Gráfico de Resumen */}
            <div className="neu-card p-6">
                <SalesChart 
                    title="Resumen Financiero - Últimos 7 días"
                    subtitle="Evolución de ventas, comisiones e IVA"
                />
            </div>
        </AdminLayout>
    );
}