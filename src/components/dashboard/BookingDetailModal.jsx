import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Booking } from "@/api/entities";
import { Property } from "@/api/entities";
import { Service } from "@/api/entities";
import { User } from "@/api/entities";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bed, Briefcase, Calendar, Clock, Home, Info, Loader2, User as UserIcon } from "lucide-react";

export default function BookingDetailModal({ booking, onClose }) {
  const [guestItinerary, setGuestItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!booking || !booking.guest_id) return;
      setLoading(true);
      try {
        const [allBookings, allProperties, allServices, guestData] = await Promise.all([
          Booking.filter({ guest_id: booking.guest_id }),
          Property.list(),
          Service.list(),
          User.list({ id: booking.guest_id })
        ]);

        if (guestData && guestData.length > 0) {
            setGuest(guestData[0]);
        }

        const itinerary = allBookings
          .sort((a, b) => new Date(a.check_in_date) - new Date(b.check_in_date))
          .map(b => {
            let itemDetails;
            if (b.property_id) {
              const property = allProperties.find(p => p.id === b.property_id);
              itemDetails = { 
                name: property?.title || "Propiedad no encontrada", 
                type: 'Alojamiento', 
                icon: Home 
              };
            } else if (b.service_id) { // Asumiendo que el campo es service_id
              const service = allServices.find(s => s.id === b.service_id);
              itemDetails = { 
                name: service?.title || "Servicio no encontrado", 
                type: 'Servicio/Experiencia', 
                icon: Briefcase 
              };
            }
            return { ...b, ...itemDetails };
          });
        
        setGuestItinerary(itinerary);

      } catch (error) {
        console.error("Error fetching guest itinerary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [booking]);
  
  if (!booking) return null;

  const currentBookingResource = guestItinerary.find(b => b.id === booking.id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalle de la Reserva</DialogTitle>
          {currentBookingResource && <DialogDescription>{currentBookingResource.name}</DialogDescription>}
        </DialogHeader>
        <div className="mt-4 space-y-6">
          
          <div className="p-4 bg-slate-50 rounded-lg">
             <h3 className="font-semibold text-lg mb-3 flex items-center"><UserIcon className="w-5 h-5 mr-2 text-blue-600"/>Información del Huésped</h3>
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-medium text-slate-500">Nombre</p>
                    <p>{guest?.full_name || 'Cargando...'}</p>
                </div>
                <div>
                    <p className="font-medium text-slate-500">Contacto</p>
                    <p>{guest?.email}</p>
                    <p>{booking.guest_phone}</p>
                </div>
             </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-600" />Itinerario Completo del Huésped</h3>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {guestItinerary.map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg border-l-4 ${item.id === booking.id ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <item.icon className="w-5 h-5 text-slate-600" />
                        <h4 className="font-semibold">{item.name}</h4>
                        {item.id === booking.id && <span className="text-xs font-bold text-blue-600">(ESTA RESERVA)</span>}
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-4 pl-8">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(item.check_in_date), 'dd MMM yyyy', { locale: es })}</span>
                            <span>-</span>
                            <span>{format(new Date(item.check_out_date), 'dd MMM yyyy', { locale: es })}</span>
                        </div>
                         <div className="flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4" />
                            <span>{item.guests_count} Huésped(es)</span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
             <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Esta información se muestra para ayudarte a coordinar y ofrecer una mejor experiencia a tu huésped. Úsala de manera responsable y profesional.</span>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}