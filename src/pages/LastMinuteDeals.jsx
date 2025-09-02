import React, { useState, useEffect } from 'react';
import { LastMinuteOffer } from '@/api/entities';
import { Property } from '@/api/entities';
import { NotificationSubscription } from '@/api/entities';
import { User } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Bell, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const OfferCard = ({ offer, property }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!offer.expires_at) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(offer.expires_at);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('¡Expirado!');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [offer.expires_at]);

  if (!property) return null; // Don't render if property data is missing

  return (
    <Card className="border-2 border-red-500 shadow-lg card-hover">
        <div className="relative overflow-hidden aspect-[4/3]">
            <img 
                src={property.images?.[0] || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'} 
                alt={property.title}
                className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
                <Badge className="bg-red-600 text-white font-bold animate-pulse">
                    <Flame className="w-4 h-4 mr-1"/>
                    Última Oportunidad
                </Badge>
            </div>
        </div>
        <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{property.title}</h3>
            <p className="text-sm text-slate-500 mb-2"><MapPin className="w-3 h-3 inline-block mr-1"/>{property.location}</p>
            
            <div className="my-3">
                <p className="text-sm text-slate-500 line-through">${offer.original_price?.toLocaleString()} / noche</p>
                <p className="text-2xl font-bold text-red-600">${offer.offer_price?.toLocaleString()} / noche</p>
            </div>

            {offer.removed_benefits?.length > 0 && (
              <div className="text-xs text-slate-600 mb-3">
                <p className="font-medium">Esta oferta no incluye:</p>
                <ul className="list-disc list-inside">
                  {offer.removed_benefits.map(benefit => <li key={benefit}>{benefit}</li>)}
                </ul>
              </div>
            )}

            <div className="text-center bg-yellow-100 text-yellow-800 font-bold py-2 px-3 rounded-md mb-4">
                Tiempo restante: {timeLeft}
            </div>

            <Link to={createPageUrl('PropertyDetail') + `?id=${property.id}&offer_id=${offer.id}`} className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700">¡Tómalo Ahora!</Button>
            </Link>
        </CardContent>
    </Card>
  );
};


export default function LastMinuteDealsPage() {
  const [offers, setOffers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [notificationEmail, setNotificationEmail] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [activeOffers, allProperties, userData] = await Promise.all([
          LastMinuteOffer.filter({ status: 'activa' }),
          Property.list(),
          User.me().catch(() => null)
        ]);
        
        setOffers(activeOffers);
        setProperties(allProperties);
        setUser(userData);
        if(userData) setNotificationEmail(userData.email);

      } catch (error) {
        console.error("Error loading offers:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNotificationSubscription = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para suscribirte a las notificaciones.');
      return;
    }
    try {
      await NotificationSubscription.create({
        user_id: user.id,
        email: notificationEmail,
        notification_type: 'last_minute_deal',
        delivery_methods: ['email']
      });
      toast.success('¡Te has suscrito! Te avisaremos de las mejores ofertas.');
    } catch (error) {
      toast.error('Error al suscribirte. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-red-600">Tómalo o Déjalo</h1>
            <p className="text-xl text-slate-600 mt-2">¡Ofertas exclusivas de última hora con descuentos increíbles!</p>
        </div>

        <Card className="mb-8 bg-blue-50">
            <CardContent className="p-6 md:flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-blue-800 text-lg">¡No te pierdas ninguna oferta!</h3>
                    <p className="text-blue-700">Recibe notificaciones de nuevas ofertas de última hora.</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <Input 
                      placeholder="Tu email..."
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)} 
                    />
                    <Button onClick={handleNotificationSubscription}>
                        <Bell className="w-4 h-4 mr-2"/>
                        Notificarme
                    </Button>
                </div>
            </CardContent>
        </Card>

        {loading ? (
            <div className="text-center">Cargando ofertas...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map(offer => {
                    const property = properties.find(p => p.id === offer.property_id);
                    return <OfferCard key={offer.id} offer={offer} property={property} />;
                })}
            </div>
        )}
    </div>
  );
}