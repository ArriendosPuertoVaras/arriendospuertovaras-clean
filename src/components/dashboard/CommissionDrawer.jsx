import React, { useState, useEffect } from 'react';
import { CommissionLedger } from '@/api/entities';
import { UnifiedBooking } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Download,
  Eye,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CommissionDrawer({ isOpen, onClose, viewMode, userId }) {
  const [commissions, setCommissions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalCommissions: 0,
    pendingPayouts: 0,
    completedBookings: 0
  });

  useEffect(() => {
    if (isOpen && userId) {
      loadCommissionData();
    }
  }, [isOpen, userId, viewMode]);

  const loadCommissionData = async () => {
    setLoading(true);
    try {
      let commissionsData = [];
      let bookingsData = [];

      if (viewMode === 'operator') {
        commissionsData = await CommissionLedger.filter({ operator_id: userId });
        bookingsData = await UnifiedBooking.filter({ operator_id: userId });
      } else {
        bookingsData = await UnifiedBooking.filter({ user_id: userId });
      }

      setCommissions(commissionsData);
      setBookings(bookingsData);

      // Calculate summary
      const totalEarnings = commissionsData.reduce((sum, c) => sum + (c.operator_payout || 0), 0);
      const totalCommissions = commissionsData.reduce((sum, c) => sum + (c.total_commission || 0), 0);
      const pendingPayouts = commissionsData
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + (c.operator_payout || 0), 0);
      const completedBookings = bookingsData.filter(b => b.status === 'completed').length;

      setSummary({
        totalEarnings,
        totalCommissions,
        pendingPayouts,
        completedBookings
      });

    } catch (error) {
      console.error('Error loading commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'Pendiente', variant: 'secondary' },
      'processed': { label: 'Procesado', variant: 'default' },
      'paid': { label: 'Pagado', variant: 'default' },
      'disputed': { label: 'Disputado', variant: 'destructive' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl">
              {viewMode === 'operator' ? 'Historial de Comisiones' : 'Resumen de Gastos'}
            </SheetTitle>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {viewMode === 'operator' ? 'Total Ganado' : 'Total Gastado'}
                      </p>
                      <p className="text-lg font-bold">
                        ${(viewMode === 'operator' ? summary.totalEarnings : 
                          bookings.reduce((sum, b) => sum + (b.price_net || 0), 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {viewMode === 'operator' && (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Comisiones Pagadas</p>
                          <p className="text-lg font-bold">${summary.totalCommissions.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Pendiente de Pago</p>
                          <p className="text-lg font-bold">${summary.pendingPayouts.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Reservas Completadas</p>
                      <p className="text-lg font-bold">{summary.completedBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue={viewMode === 'operator' ? 'commissions' : 'bookings'}>
              <TabsList>
                {viewMode === 'operator' && (
                  <TabsTrigger value="commissions">Comisiones</TabsTrigger>
                )}
                <TabsTrigger value="bookings">
                  {viewMode === 'operator' ? 'Reservas' : 'Mis Reservas'}
                </TabsTrigger>
              </TabsList>

              {viewMode === 'operator' && (
                <TabsContent value="commissions" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Historial de Comisiones</h3>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>

                  {commissions.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-500">No hay comisiones registradas</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {commissions.map((commission) => (
                        <Card key={commission.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Reserva #{commission.booking_id?.slice(-8)}</p>
                                <p className="text-sm text-gray-600">
                                  {format(new Date(commission.created_date), 'dd MMM yyyy', { locale: es })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">${commission.operator_payout?.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">
                                  Comisión: ${commission.total_commission?.toLocaleString()}
                                </p>
                                {getStatusBadge(commission.status)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}

              <TabsContent value="bookings" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {viewMode === 'operator' ? 'Reservas Recibidas' : 'Mis Reservas'}
                  </h3>
                </div>

                {bookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No hay reservas registradas</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {booking.resource_type === 'lodging' ? 'Alojamiento' : 'Servicio'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(booking.start_at), 'dd MMM yyyy', { locale: es })} - 
                                {format(new Date(booking.end_at), 'dd MMM yyyy', { locale: es })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${booking.price_net?.toLocaleString()}</p>
                              <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}