import React, { useState, useEffect } from "react";
import { Booking } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Users, AlertCircle, Loader2 } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { login } from "@/components/utils/auth";

export default function BookingForm({ property, user, onBookingComplete }) {
  const [dateRange, setDateRange] = useState(undefined);
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && property.price_per_night) {
      const diffDays = differenceInCalendarDays(dateRange.to, dateRange.from);
      if (diffDays > 0) {
        setNights(diffDays);
        setTotalPrice(diffDays * property.price_per_night);
      } else {
        setNights(0);
        setTotalPrice(0);
      }
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  }, [dateRange, property.price_per_night]);

  const handleBooking = async () => {
    setError(null);

    if (!user) {
      setError("Debes iniciar sesión para poder reservar.");
      return;
    }
    if (!dateRange?.from || !dateRange?.to) {
      setError("Por favor, selecciona las fechas de entrada y salida.");
      return;
    }
    if (nights <= 0) {
      setError("La fecha de salida debe ser posterior a la fecha de entrada.");
      return;
    }
    if (!termsAccepted) {
      setError("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        property_id: property.id,
        guest_id: user.id,
        owner_id: property.owner_id,
        check_in_date: dateRange.from.toISOString().split('T')[0],
        check_out_date: dateRange.to.toISOString().split('T')[0],
        guests_count: parseInt(guests, 10),
        total_nights: nights,
        subtotal: totalPrice,
        platform_fee: totalPrice * 0.12, // Asumiendo 12% de comisión
        total_amount: totalPrice + (totalPrice * 0.12),
        status: "confirmada", // Esto podría cambiar a 'pendiente' en un flujo de pago real
        payment_status: "pendiente",
        guest_email: user.email,
        terms_accepted: true,
      };

      await Booking.create(bookingData);
      
      toast.success("¡Reserva creada con éxito! Revisa tu correo para más detalles.");
      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.message || "Ocurrió un error inesperado al procesar tu reserva. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!property) {
    return null;
  }
  
  const finalPrice = (totalPrice + totalPrice * 0.12).toLocaleString();

  return (
    <Card className="neuro-card-outset">
      <CardHeader>
        <CardTitle className="text-xl">
          <span className="font-bold text-2xl">${property.price_per_night?.toLocaleString()}</span>
          <span className="text-base text-slate-600"> / noche</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Fechas</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal neuro-input"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Selecciona tus fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="guests">Huéspedes</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="guests"
              type="number"
              min="1"
              max={property.max_guests || 10}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="neuro-input pl-10"
              placeholder="Número de huéspedes"
            />
          </div>
        </div>

        {nights > 0 && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-slate-600">
              <span>${property.price_per_night?.toLocaleString()} x {nights} noches</span>
              <span>${(property.price_per_night * nights).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Comisión de servicio</span>
              <span>${(totalPrice * 0.12).toLocaleString()}</span>
            </div>
            <hr className="my-2 border-slate-200" />
            <div className="flex justify-between font-bold text-slate-900">
              <span>Total</span>
              <span>${finalPrice}</span>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="terms" 
            checked={termsAccepted}
            onCheckedChange={setTermsAccepted}
          />
          <Label htmlFor="terms" className="text-sm font-normal">
            He leído y acepto los <Link to={createPageUrl("TermsAndConditions")} className="underline text-blue-600">Términos y Condiciones</Link>
          </Label>
        </div>

        {!user ? (
           <Button className="w-full" onClick={login}>
             Inicia sesión para reservar
           </Button>
        ) : (
          <Button onClick={handleBooking} disabled={loading || nights === 0} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Procesando..." : `Reservar - $${finalPrice}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}