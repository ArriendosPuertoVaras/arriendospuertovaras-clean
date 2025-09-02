import React, { useState, useEffect } from 'react';
import { UnifiedBooking } from '@/api/entities';
import { Property } from '@/api/entities';
import { Service } from '@/api/entities';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Home,
  Briefcase,
  Wrench,
  Sparkles,
  Clock,
  MapPin,
  User,
  Plane,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import BookingDetailModal from './BookingDetailModal';

// Icon mapping for different resource types
const resourceTypeIcons = {
  lodging: Home,
  vehicle: Plane,
  service: Wrench,
  experience: Sparkles,
  task: Briefcase,
  booking: CalendarIcon
};

// Colors for events in the calendar
const eventColors = {
  booking: {
    lodging: 'bg-blue-100 text-blue-800 border-l-blue-500',
    vehicle: 'bg-green-100 text-green-800 border-l-green-500',
    service: 'bg-orange-100 text-orange-800 border-l-orange-500',
    experience: 'bg-purple-100 text-purple-800 border-l-purple-500',
    default: 'bg-gray-100 text-gray-800 border-l-gray-500'
  },
  task: {
    cleaning: 'bg-yellow-100 text-yellow-800 border-l-yellow-500',
    maintenance: 'bg-red-100 text-red-800 border-l-red-500',
    other: 'bg-gray-200 text-gray-800 border-l-gray-500',
    default: 'bg-gray-200 text-gray-800 border-l-gray-500'
  }
};

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function UnifiedCalendar({ operatorId, isOperatorView = false, properties = [], services = [] }) {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    const loadCalendarData = async () => {
      if (!operatorId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const fetchedBookings = await UnifiedBooking.filter({ operator_id: operatorId });
        setBookings(fetchedBookings || []);
        toast.success('Datos del calendario cargados exitosamente');
      } catch (error) {
        console.error("Error loading calendar data:", error);
        toast.error('Error al cargar los datos del calendario');
      } finally {
        setLoading(false);
      }
    };

    loadCalendarData();
  }, [operatorId]);

  useEffect(() => {
    const bookingEvents = mapBookingsToEvents(bookings, isOperatorView, properties, services);
    setEvents(bookingEvents);
  }, [bookings, isOperatorView, properties, services]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, events]);

  const mapBookingsToEvents = (bookingsData, isOperator, props, srvs) => {
    return bookingsData.map(booking => {
      let resource;
      let resourceType = 'default';
      let resourceName = 'Recurso Desconocido';
      let resourceIcon = null;

      if (booking.property_id) {
        resource = props.find(p => p.id === booking.property_id);
        resourceType = 'lodging';
        resourceName = resource ? resource.title : 'Alojamiento no encontrado';
        resourceIcon = resourceTypeIcons.lodging;
      } else if (booking.service_id) {
        resource = srvs.find(s => s.id === booking.service_id);
        resourceType = 'service';
        resourceName = resource ? resource.title : 'Servicio no encontrado';
        resourceIcon = resourceTypeIcons.service;
      }

      const eventTitle = isOperator
        ? `Reserva: ${resourceName}`
        : `Estadía en ${resourceName}`;

      return {
        ...booking,
        title: eventTitle,
        start: new Date(booking.check_in_date || booking.start_at),
        end: new Date(booking.check_out_date || booking.end_at),
        resourceType,
        resourceName,
        resourceIcon
      };
    });
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDateForLoop = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter(event => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return currentDateForLoop >= eventStart && currentDateForLoop <= eventEnd;
      });

      days.push({
        date: new Date(currentDateForLoop),
        isCurrentMonth: currentDateForLoop.getMonth() === month,
        isToday: currentDateForLoop.toDateString() === new Date().toDateString(),
        events: dayEvents
      });
      
      currentDateForLoop.setDate(currentDateForLoop.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleEventClick = (event) => {
    if (event.resource_type === 'booking' || event.property_id || event.service_id) {
      setSelectedBooking(event);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-white p-4 rounded-lg shadow">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando calendario...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
          Hoy
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {DAYS.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`min-h-[100px] p-1 border border-gray-200 ${
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
            } ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            <div className={`text-sm font-medium mb-1 ${
              day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
            } ${day.isToday ? 'text-blue-600' : ''}`}>
              {day.date.getDate()}
            </div>
            
            {/* Events for this day */}
            <div className="space-y-1">
              {day.events.slice(0, 2).map((event, eventIndex) => {
                const colors = eventColors.booking[event.resourceType] || eventColors.booking.default;
                const IconComponent = event.resourceIcon || CalendarIcon;
                
                return (
                  <div
                    key={eventIndex}
                    onClick={() => handleEventClick(event)}
                    className={`text-xs p-1 rounded cursor-pointer border-l-2 ${colors} hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center space-x-1">
                      <IconComponent className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate font-medium">{event.title}</span>
                    </div>
                  </div>
                );
              })}
              
              {day.events.length > 2 && (
                <div className="text-xs text-gray-500 p-1">
                  +{day.events.length - 2} más
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          properties={properties}
          services={services}
        />
      )}
    </div>
  );
}