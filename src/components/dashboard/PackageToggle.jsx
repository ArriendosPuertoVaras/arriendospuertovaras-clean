import React, { useState } from 'react';
import { OperatorProfile } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Package, Zap, TrendingUp, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function PackageToggle({ operatorProfile, onUpdate }) {
  const [isEnabled, setIsEnabled] = useState(operatorProfile?.package_participation || false);
  const [discountPct, setDiscountPct] = useState([operatorProfile?.default_discount_pct || 20]);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (enabled) => {
    setLoading(true);
    try {
      await OperatorProfile.update(operatorProfile.id, {
        package_participation: enabled,
        default_discount_pct: discountPct[0]
      });
      
      setIsEnabled(enabled);
      toast.success(enabled ? 
        'Participación en paquetes activada' : 
        'Participación en paquetes desactivada'
      );
      
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Error al actualizar configuración');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountChange = async (value) => {
    setDiscountPct(value);
    if (isEnabled) {
      try {
        await OperatorProfile.update(operatorProfile.id, {
          default_discount_pct: value[0]
        });
        toast.success('Descuento actualizado');
        if (onUpdate) onUpdate();
      } catch (error) {
        toast.error('Error al actualizar descuento');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toggle Principal */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="font-semibold text-lg">Paquetes Dinámicos</h3>
            <p className="text-sm text-gray-600">
              Participa en paquetes automáticos con otros operadores
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      {/* Configuración de Descuento */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Configuración de Descuentos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Descuento por Defecto para Paquetes: {discountPct[0]}%
              </label>
              <Slider
                value={discountPct}
                onValueChange={setDiscountPct}
                onChangeCommitted={handleDiscountChange}
                max={50}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">¿Cómo funcionan los paquetes?</p>
                  <p className="text-blue-700 mt-1">
                    Cuando los clientes reservan múltiples servicios/propiedades, 
                    se aplica automáticamente este descuento. Tu participación 
                    aumenta la visibilidad y puede generar más reservas.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Beneficios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span>Beneficios de Participar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Mayor visibilidad en búsquedas combinadas</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Atrae clientes que buscan experiencias completas</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Algoritmo prioriza operadores colaborativos</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Compensación por mayor volumen de reservas</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}