import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageUrl } from '@/utils';

export default function PagoError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Estado de la Transacción</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <XCircle className="h-16 w-16 mx-auto text-red-500" />
          <p className="mt-4 text-xl font-bold text-red-700">Pago Fallido o Cancelado</p>
          <p className="text-gray-600 mt-2">
            La transacción no pudo ser completada. Puedes intentar nuevamente desde la página de la propiedad.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <Button asChild variant="outline">
              <Link to={createPageUrl('Home')}>Volver al Inicio</Link>
            </Button>
             <Button asChild>
              <Link to={createPageUrl('Properties')}>Ver Propiedades</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}