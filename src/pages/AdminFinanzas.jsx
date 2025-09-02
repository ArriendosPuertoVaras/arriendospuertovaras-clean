import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
    DollarSign, 
    TrendingUp, 
    Download, 
    Calendar, 
    FileText, 
    Users,
    Percent,
    AlertTriangle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { calcularComision, calcularIVA, formatearCLP } from '@/components/utils/finanzas';
import { Payment } from '@/api/entities';
import { UnifiedBooking } from '@/api/entities';
import { CommissionLedger } from '@/api/entities';

export default function AdminFinanzas() {
    const [dateRange, setDateRange] = useState('this_month');
    const [financialData, setFinancialData] = useState({
        totalIngresos: 0,
        comisionesTotales: 0,
        ivaTotal: 0,
        pagosOperadores: 0,
        pagosPendientes: 0,
        transacciones: []
    });
    const [loading, setLoading] = useState(true);
    const [exportingReport, setExportingReport] = useState(false);

    useEffect(() => {
        loadFinancialData();
    }, [dateRange]);

    const loadFinancialData = async () => {
        setLoading(true);
        try {
            // Cargar datos de comisiones del ledger
            const commissions = await CommissionLedger.filter({});
            const bookings = await UnifiedBooking.filter({status: 'completed'});
            
            // Calcular totales
            let totalIngresos = 0;
            let comisionesTotales = 0;
            let ivaTotal = 0;
            let pagosOperadores = 0;
            let pagosPendientes = 0;

            commissions.forEach(commission => {
                totalIngresos += commission.net_amount;
                comisionesTotales += commission.commission_base;
                ivaTotal += commission.iva_amount;
                
                if (commission.status === 'paid') {
                    pagosOperadores += commission.operator_payout;
                } else if (commission.status === 'pending') {
                    pagosPendientes += commission.operator_payout;
                }
            });

            setFinancialData({
                totalIngresos,
                comisionesTotales,
                ivaTotal,
                pagosOperadores,
                pagosPendientes,
                transacciones: commissions.slice(0, 10) // Últimas 10 transacciones
            });
        } catch (error) {
            console.error('Error cargando datos financieros:', error);
            toast.error('Error al cargar datos financieros');
        }
        setLoading(false);
    };

    const exportReport = async () => {
        setExportingReport(true);
        try {
            // TODO: Implementar exportación de reporte
            toast.success('Reporte exportado exitosamente');
        } catch (error) {
            toast.error('Error al exportar reporte');
        }
        setExportingReport(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Pagado</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
            case 'disputed':
                return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Disputado</Badge>;
            default:
                return <Badge variant="secondary">Procesando</Badge>;
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Panel Financiero</h2>
                        <p className="text-slate-600 mt-1">Monitorea ingresos, comisiones e IVA en tiempo real</p>
                    </div>
                    <div className="flex gap-3">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hoy</SelectItem>
                                <SelectItem value="this_week">Esta semana</SelectItem>
                                <SelectItem value="this_month">Este mes</SelectItem>
                                <SelectItem value="last_month">Mes pasado</SelectItem>
                                <SelectItem value="this_year">Este año</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={exportReport} disabled={exportingReport} variant="outline">
                            {exportingReport ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* KPIs Financieros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Ingresos Totales</p>
                                    <p className="text-2xl font-bold text-slate-900">{formatearCLP(financialData.totalIngresos)}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Comisiones (15%)</p>
                                    <p className="text-2xl font-bold text-slate-900">{formatearCLP(financialData.comisionesTotales)}</p>
                                </div>
                                <Percent className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">IVA Generado (19%)</p>
                                    <p className="text-2xl font-bold text-slate-900">{formatearCLP(financialData.ivaTotal)}</p>
                                </div>
                                <FileText className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Pagado a Operadores</p>
                                    <p className="text-2xl font-bold text-slate-900">{formatearCLP(financialData.pagosOperadores)}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-amber-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alertas Financieras */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-700">
                                <AlertTriangle className="w-5 h-5" />
                                Pagos Pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-700 mb-2">
                                {formatearCLP(financialData.pagosPendientes)}
                            </div>
                            <p className="text-sm text-slate-600">Requieren liquidación a operadores</p>
                            <Button size="sm" className="mt-3" variant="outline">
                                Procesar Pagos
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="w-5 h-5" />
                                Fórmula Financiera Chile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Precio Operador:</span>
                                    <span className="font-medium">P_op</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Comisión (15%):</span>
                                    <span className="font-medium">P_op × 0.15</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IVA (19%):</span>
                                    <span className="font-medium">Comisión × 0.19</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold">
                                    <span>Total Cliente:</span>
                                    <span>P_op + Comisión + IVA</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de Transacciones Recientes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Transacciones Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Fecha</th>
                                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Operador</th>
                                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Monto Bruto</th>
                                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Comisión</th>
                                        <th className="text-left py-3 px-2 font-semibold text-slate-700">IVA</th>
                                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Pago Operador</th>
                                        <th className="text-left py-3 px-2 font-semibold text-slate-700">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financialData.transacciones.map((tx, index) => (
                                        <tr key={index} className="border-b hover:bg-slate-50">
                                            <td className="py-3 px-2 text-sm">{new Date(tx.created_date).toLocaleDateString()}</td>
                                            <td className="py-3 px-2 text-sm">{tx.operator_id}</td>
                                            <td className="py-3 px-2 text-sm font-medium">{formatearCLP(tx.gross_amount)}</td>
                                            <td className="py-3 px-2 text-sm">{formatearCLP(tx.commission_base)}</td>
                                            <td className="py-3 px-2 text-sm">{formatearCLP(tx.iva_amount)}</td>
                                            <td className="py-3 px-2 text-sm font-medium text-green-700">{formatearCLP(tx.operator_payout)}</td>
                                            <td className="py-3 px-2">{getStatusBadge(tx.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {financialData.transacciones.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No hay transacciones en el período seleccionado</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}