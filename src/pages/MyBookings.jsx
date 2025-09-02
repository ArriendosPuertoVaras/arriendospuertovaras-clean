
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Booking } from "@/api/entities";
import { Property } from "@/api/entities";
import { User } from "@/api/entities";
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { login } from '@/components/utils/auth'; // Added import for login utility

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        // Per the outline, filter bookings only by guest_id.
        // This implies the page primarily displays bookings made by the current user (as a guest).
        // Using "-created_date" for sorting as per original code, not "-check_in_date" from outline
        // as no context for that change was provided.
        const userBookings = await Booking.filter({ guest_id: currentUser.id }, "-created_date");
        setBookings(userBookings);

        // Load property details for each booking
        const propertiesData = {};
        // Fetch all properties once to find associated properties efficiently
        const allProperties = await Property.list();

        for (const booking of userBookings) {
          const property = allProperties.find(p => p.id === booking.property_id);
          if (property) {
            propertiesData[booking.property_id] = property;
          }
        }
        setProperties(propertiesData);

      } catch (error) {
        console.error("Authentication or booking loading error:", error);
        // Usa la función de login centralizada
        await login();
      } finally {
        setLoading(false); // Ensure loading state is turned off regardless of outcome
      }
    };

    checkAuthAndLoadData();
  }, []);

  const getStatusBadge = (booking) => {
    const statusConfig = {
      'pendiente': { label: 'Pendiente', variant: 'secondary', icon: Clock },
      'confirmada': { label: 'Confirmada', variant: 'default', icon: CheckCircle },
      'pagada': { label: 'Pagada', variant: 'default', icon: CreditCard },
      'completada': { label: 'Completada', variant: 'default', icon: CheckCircle },
      'cancelada': { label: 'Cancelada', variant: 'destructive', icon: XCircle }
    };

    const config = statusConfig[booking.status] || statusConfig['pendiente'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const filterBookings = (status) => {
    if (status === 'upcoming') {
      return bookings.filter(booking =>
        new Date(booking.check_in_date) > new Date() &&
        ['confirmada', 'pagada'].includes(booking.status)
      );
    }
    if (status === 'current') {
      return bookings.filter(booking => {
        const today = new Date();
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        return checkIn <= today && checkOut > today && booking.status !== 'cancelada';
      });
    }
    if (status === 'past') {
      return bookings.filter(booking =>
        new Date(booking.check_out_date) < new Date() ||
        booking.status === 'completada'
      );
    }
    return bookings;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is null here, it means authentication failed and loginWithRedirect
  // should have been triggered, or there was an issue.
  // Returning null prevents rendering without user data.
  if (!user) {
    return null;
  }

  const crumbs = [
    { label: 'Mi Cuenta', href: createPageUrl('MiCuenta') },
    { label: 'Mis Reservas' }
  ];

  const BookingCard = ({ booking }) => {
    const property = properties[booking.property_id];
    if (!property) return null; // Don't render if property data is missing

    return (
      <Card className="overflow-hidden">
        <div className="md:flex">
          <div className="md:w-48 aspect-[4/3] md:aspect-auto">
            <img
              src={property.images?.[0] || "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop"}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  <Link
                    to={createPageUrl("PropertyDetail") + `?id=${property.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {property.title}
                  </Link>
                </h3>
                <div className="flex items-center text-slate-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.location}</span>
                </div>
              </div>
              {getStatusBadge(booking)}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-slate-600">
                <Calendar className="w-4 h-4 mr-2" />
                <div>
                  <div className="font-medium">Entrada</div>
                  <div className="text-sm">
                    {format(new Date(booking.check_in_date), "d MMM yyyy", { locale: es })}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-slate-600">
                <Calendar className="w-4 h-4 mr-2" />
                <div>
                  <div className="font-medium">Salida</div>
                  <div className="text-sm">
                    {format(new Date(booking.check_out_date), "d MMM yyyy", { locale: es })}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-slate-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{booking.guests_count} huéspedes</span>
              </div>

              <div className="flex items-center text-slate-600">
                <CreditCard className="w-4 h-4 mr-2" />
                <span className="font-semibold">${booking.total_amount?.toLocaleString()}</span>
              </div>
            </div>

            {booking.special_requests && (
              <div className="bg-slate-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-slate-600">
                  <strong>Solicitudes especiales:</strong> {booking.special_requests}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-500">
                Reserva #{booking.id?.slice(-8)}
              </div>

              <div className="flex space-x-3">
                {/* This button is conditional based on user.user_type and booking status.
                    Given the change to filter by guest_id, user.user_type will always be 'arrendatario' here. */}
                {booking.status === 'completada' && user.user_type === 'arrendatario' && (
                  <Button size="sm" variant="outline">
                    <Star className="w-4 h-4 mr-1" />
                    Calificar
                  </Button>
                )}

                <Link to={createPageUrl("PropertyDetail") + `?id=${property.id}`}>
                  <Button size="sm" variant="outline">
                    Ver propiedad
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs crumbs={crumbs} />
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {/* Title reflects user type, which will be 'arrendatario' given the guest_id filter */}
          {user.user_type === 'arrendatario' ? 'Mis Reservas' : 'Reservas Recibidas'}
        </h1>
        <p className="text-xl text-slate-600">
          {bookings.length} reservas en total
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todas ({bookings.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Próximas ({filterBookings('upcoming').length})</TabsTrigger>
          <TabsTrigger value="current">Actuales ({filterBookings('current').length})</TabsTrigger>
          <TabsTrigger value="past">Pasadas ({filterBookings('past').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {bookings.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No tienes reservas aún
              </h3>
              <p className="text-slate-600 mb-6">
                {/* Message reflects user type, which will be 'arrendatario' given the guest_id filter */}
                {user.user_type === 'arrendatario'
                  ? 'Explora nuestras propiedades y haz tu primera reserva'
                  : 'Las reservas de tus propiedades aparecerán aquí'
                }
              </p>
              {user.user_type === 'arrendatario' && (
                <Link to={createPageUrl("Properties")}>
                  <Button>Explorar Propiedades</Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {filterBookings('upcoming').map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="current" className="space-y-4">
          {filterBookings('current').map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filterBookings('past').map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
