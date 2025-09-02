
import React, { useState } from "react";
import { createPageUrl } from "@/utils";
import { ServiceReservation } from "@/api/entities";
import { Property } from "@/api/entities";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function ServiceBookingForm({ service, user, onCancel }) {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [userProperties, setUserProperties] = useState([]);
  
  const [bookingData, setBookingData] = useState({
    reservation_date: '',
    start_time: '',
    duration_hours: service.min_duration_hours || 1,
    property_id: '',
    customer_address: '',
    customer_phone: user?.phone || '',
    special_instructions: '',
    selected_extras: [],
    blocks_property_calendar: false
  });

  React.useEffect(() => {
    if (user?.user_type === 'arrendador') {
      loadUserProperties();
    }
  }, [user]);

  const loadUserProperties = async () => {
    try {
      const properties = await Property.filter({ owner_id: user.id });
      setUserProperties(properties);
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  const calculatePricing = () => {
    const basePrice = service.pricing_model === 'por_hora' 
      ? service.price_per_hour * bookingData.duration_hours
      : service.pricing_model === 'por_dia'
      ? service.price_per_day
      : service.price_per_service;
    
    const extrasTotal = bookingData.selected_extras.reduce((sum, extra) => 
      sum + (extra.included ? 0 : extra.price), 0
    );
    
    const subtotal = basePrice + extrasTotal;
    const platformFee = subtotal * 0.15; // 15% commission
    const ivaAmount = platformFee * 0.19; // 19% IVA on commission
    const total = subtotal + platformFee + ivaAmount;
    const providerPayout = subtotal - platformFee;

    return {
      basePrice,
      extrasTotal,
      subtotal,
      platformFee,
      ivaAmount,
      total,
      providerPayout
    };
  };

  const handleExtraToggle = (extra) => {
    const isSelected = bookingData.selected_extras.some(e => e.name === extra.name);
    
    if (isSelected) {
      setBookingData(prev => ({
        ...prev,
        selected_extras: prev.selected_extras.filter(e => e.name !== extra.name)
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        selected_extras: [...prev.selected_extras, extra]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      const pricing = calculatePricing();
      
      const reservationData = {
        service_id: service.id,
        customer_id: user.id,
        provider_id: service.provider_id,
        property_id: bookingData.property_id || null,
        ...bookingData,
        subtotal: pricing.subtotal,
        extras_total: pricing.extrasTotal,
        platform_fee: pricing.platformFee,
        iva_amount: pricing.ivaAmount,
        total_amount: pricing.total,
        provider_payout: pricing.providerPayout,
        end_time: calculateEndTime(bookingData.start_time, bookingData.duration_hours)
      };

      await ServiceReservation.create(reservationData);
      setStep(3);
      toast.success("¡Reserva creada exitosamente!");
      
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error("Error al crear la reserva. Inténtalo nuevamente.");
    }
    setLoading(false);
  };

  const calculateEndTime = (startTime, durationHours) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + durationHours;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const pricing = calculatePricing();

  if (step === 3) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">¡Reserva Confirmada!</h3>
        <p className="text-gray-600">
          Hemos enviado los detalles a tu correo electrónico.
          El proveedor se contactará contigo pronto.
        </p>
        <Button onClick={() => window.location.href = createPageUrl("MyBookings")} className="w-full">
          Ver Mis Reservas
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === 1 && (
        <>
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={bookingData.reservation_date}
                onChange={(e) => setBookingData(prev => ({...prev, reservation_date: e.target.value}))}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={bookingData.start_time}
                onChange={(e) => setBookingData(prev => ({...prev, start_time: e.target.value}))}
                required
              />
            </div>
          </div>

          {/* Duration */}
          {service.pricing_model === 'por_hora' && (
            <div>
              <Label htmlFor="duration">Duración (horas)</Label>
              <Input
                id="duration"
                type="number"
                min={service.min_duration_hours || 1}
                value={bookingData.duration_hours}
                onChange={(e) => setBookingData(prev => ({...prev, duration_hours: parseInt(e.target.value)}))}
                required
              />
            </div>
          )}

          {/* Property Selection (for property owners) */}
          {userProperties.length > 0 && (
            <div>
              <Label htmlFor="property">Vincular a Propiedad (Opcional)</Label>
              <Select 
                value={bookingData.property_id} 
                onValueChange={(value) => setBookingData(prev => ({...prev, property_id: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una propiedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No vincular</SelectItem>
                  {userProperties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {bookingData.property_id && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={bookingData.blocks_property_calendar}
                      onCheckedChange={(checked) => setBookingData(prev => ({...prev, blocks_property_calendar: checked}))}
                    />
                    <Label className="text-sm">Bloquear calendario de la propiedad durante el servicio</Label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Address */}
          <div>
            <Label htmlFor="address">Dirección del Servicio</Label>
            <Input
              id="address"
              value={bookingData.customer_address}
              onChange={(e) => setBookingData(prev => ({...prev, customer_address: e.target.value}))}
              placeholder="Dirección donde se realizará el servicio"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Teléfono de Contacto</Label>
            <Input
              id="phone"
              type="tel"
              value={bookingData.customer_phone}
              onChange={(e) => setBookingData(prev => ({...prev, customer_phone: e.target.value}))}
              placeholder="+56 9 1234 5678"
              required
            />
          </div>

          {/* Extras */}
          {service.extras && service.extras.length > 0 && (
            <div>
              <Label>Servicios Adicionales</Label>
              <div className="space-y-2 mt-2">
                {service.extras.map((extra, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={bookingData.selected_extras.some(e => e.name === extra.name)}
                        onCheckedChange={() => handleExtraToggle(extra)}
                        disabled={extra.included}
                      />
                      <span className={extra.included ? 'text-gray-500' : ''}>{extra.name}</span>
                    </div>
                    <span className="font-medium">
                      {extra.included ? 'Incluido' : `+$${extra.price?.toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <Label htmlFor="instructions">Instrucciones Especiales</Label>
            <Textarea
              id="instructions"
              value={bookingData.special_instructions}
              onChange={(e) => setBookingData(prev => ({...prev, special_instructions: e.target.value}))}
              placeholder="Detalles adicionales para el proveedor..."
              rows={3}
            />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Servicio base</span>
                <span>${pricing.basePrice.toLocaleString()}</span>
              </div>
              {pricing.extrasTotal > 0 && (
                <div className="flex justify-between">
                  <span>Extras</span>
                  <span>${pricing.extrasTotal.toLocaleString()}</span>
              </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Comisión plataforma (15%)</span>
                <span>${pricing.platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>IVA sobre comisión (19%)</span>
                <span>${pricing.ivaAmount.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total a Pagar</span>
                <span>${pricing.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <CreditCard className="w-4 h-4 inline mr-1" />
              El pago se procesará de forma segura. El proveedor recibirá ${pricing.providerPayout.toLocaleString()} después de completar el servicio.
            </p>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={step === 1 ? onCancel : () => setStep(step - 1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 1 ? 'Cancelar' : 'Anterior'}
        </Button>
        
        <Button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : 
           step === 1 ? 'Continuar' : 
           'Confirmar y Pagar'}
        </Button>
      </div>
    </form>
  );
}
