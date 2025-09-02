import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Upload, Zap } from "lucide-react";

export default function StepProfile({ data, updateData, onNext }) {
  const handleInputChange = (field, value) => {
    updateData('hostProfile', { [field]: value });
  };

  const canProceed = data.hostProfile.name && data.hostProfile.email;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Tu Perfil de Anfitrión
        </h2>
        <p className="text-slate-600">
          Esta información será visible para los huéspedes interesados
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Nombre completo *</Label>
          <Input
            id="name"
            value={data.hostProfile.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Tu nombre completo"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Correo electrónico *</Label>
          <Input
            id="email"
            type="email"
            value={data.hostProfile.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="tu@correo.com"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={data.hostProfile.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+56 9 1234 5678"
        />
      </div>

      {/* Profile Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Foto de perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-600 mb-2">
              Sube una foto tuya para generar confianza
            </p>
            <Button variant="outline" size="sm">
              Seleccionar foto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Minute Deals */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="lastMinute"
              checked={data.hostProfile.joinLastMinuteDeals}
              onCheckedChange={(checked) => handleInputChange('joinLastMinuteDeals', checked)}
            />
            <div className="flex-1">
              <Label htmlFor="lastMinute" className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Participar en "Tómalo o Déjalo"</span>
              </Label>
              <p className="text-xs text-amber-700 mt-1">
                Ofrece descuentos automáticos en fechas sin reserva para maximizar ocupación
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="btn-primary"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}