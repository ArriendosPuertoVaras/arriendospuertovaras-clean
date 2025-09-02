import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { webpay } from '@/api/functions';
import { toast } from 'sonner';

export default function PagoExito() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const commitTransaction = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token_ws');

      if (!token) {
        setError('Token de Webpay no encontrado.');
        setLoading(false);
        return;
      }

      try {
        const response = await webpay({ action: 'commit', token_ws: token });
        if (response.data.success) {
          setBookingDetails(response.data.details);
          toast.success('¡Pago confirmado con éxito!');
        } else {
          setError(response.data.details?.response_reason || 'El pago no pudo ser confirmado por el banco.');
          toast.error('Error al confirmar el pago.');
        }
      } catch (err) {
        setError('Ocurrió un error al procesar la transacción.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    commitTransaction();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Estado de la Transacción</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {loading ? (
            <>
              <Loader2 className="h-16 w-16 mx-auto text-blue-500 animate-spin" />
              <p className="mt-4 text-lg font-semibold">Confirmando tu pago...</p>
              <p className="text-gray-600">Por favor, no cierres esta ventana.</p>
            </>
          ) : error ? (
            <>
              <CheckCircle className="h-16 w-16 mx-auto text-red-500" />
              <p className="mt-4 text-xl font-bold text-red-700">Error en el Pago</p>
              <p className="text-gray-600 mt-2">{error}</p>
              <Button asChild className="mt-6">
                <Link to={createPageUrl('Home')}>Volver al Inicio</Link>
              </Button>
            </>
          ) : (
            <>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <p className="mt-4 text-xl font-bold text-green-700">¡Pago Exitoso!</p>
              <p className="text-gray-600 mt-2">Tu reserva ha sido confirmada.</p>
              {bookingDetails && (
                <div className="text-left bg-gray-50 p-4 rounded-lg mt-4 text-sm">
                  <p><strong>Monto:</strong> ${bookingDetails.amount.toLocaleString()}</p>
                  <p><strong>Orden de Compra:</strong> {bookingDetails.buy_order}</p>
                  <p><strong>Código de Autorización:</strong> {bookingDetails.authorization_code}</p>
                  <p><strong>Fecha:</strong> {new Date(bookingDetails.transaction_date).toLocaleString()}</p>
                </div>
              )}
              <Button asChild className="mt-6">
                <Link to={createPageUrl('MyBookings')}>Ver mis Reservas</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}