
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { Review } from "@/api/entities";
import { User } from "@/api/entities";
import { PropertyGuide } from "@/api/entities";
import { CancellationPolicy } from "@/api/entities";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Users,
  Star,
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee,
  Tv,
  ArrowLeft,
  Calendar,
  Check,
  X,
  Navigation,
  BookOpen,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import BookingForm from "../components/property/BookingForm";
import ReviewSection from "../components/property/ReviewSection";
import HostProfile from "../components/property/HostProfile";
import LazyImage from "@/components/ui/LazyImage";
import LazyMap from "@/components/ui/LazyMap";
import { getCachedData } from "@/components/utils/cache";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { setPageMeta, generateStructuredData, insertStructuredData } from "@/components/utils/seo";
import BackButton from '@/components/ui/BackButton';

// Set up default icon for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const amenityIconsList = {
    estacionamiento_privado: Car,
    wifi_alta_velocidad: Wifi,
    cocina_equipada: Coffee,
    tv_smart_tv: Tv,
    tinaja_caliente: Star,
    piscina_exterior: Star,
    quincho_techado: Star,
    permite_mascotas: Star,
};

export default function PropertyDetailPage() {
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [owner, setOwner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [propertyGuide, setPropertyGuide] = useState(null);
  const [cancellationPolicy, setCancellationPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);

  const bookingFormRef = useRef(null);

  useEffect(() => {
    loadPropertyData();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const loadPropertyData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const propertyId = urlParams.get('id');

      if (!propertyId) {
        navigate(createPageUrl("Properties"));
        return;
      }

      const cacheKey = `property-${propertyId}`;
      const [propertyData, reviewsData] = await Promise.all([
        getCachedData(cacheKey, async () => {
          const propertyResult = await Property.filter({ id: propertyId });
          return propertyResult.length > 0 ? propertyResult[0] : null;
        }, 600000),
        Review.filter({ property_id: propertyId, status: "aprobada" }, "-created_date")
      ]);

      if (!propertyData) {
        navigate(createPageUrl("Properties"));
        return;
      }

      setProperty(propertyData);
      setReviews(reviewsData);

      // --- SEO Meta Tag Generation ---
      const title = `${propertyData.title} | Arriendos en ${propertyData.location}`;
      let description = propertyData.description || `Propiedad equipada en ${propertyData.location}. Consulta disponibilidad y reserva.`;
      
      // Truncate description for SEO best practices
      if (description.length > 155) {
        description = description.substring(0, 152) + '...';
      }
      
      // Since there's no slug, the canonical URL is the current page's URL.
      const canonical = window.location.href;
      
      const ogImage = propertyData.images?.[0] || 'https://arriendospuertovaras.cl/media/og-default.jpg';

      setPageMeta(title, description, canonical, ogImage);

      const propertyStructuredData = generateStructuredData('property', propertyData);
      insertStructuredData(propertyStructuredData);
      // --- End SEO Meta Tag Generation ---

      const breadcrumbs = [
        { label: 'Inicio', href: createPageUrl('Home') },
        { label: 'Propiedades', href: createPageUrl('Properties') },
        { label: propertyData.title }
      ];
      const breadcrumbsData = generateStructuredData('breadcrumbs', breadcrumbs);
      insertStructuredData(breadcrumbsData);

      const ownerData = await getCachedData(`user-${propertyData.owner_id}`, async () => {
        const users = await User.list();
        return users.find(u => u.id === propertyData.owner_id);
      }, 600000);
      setOwner(ownerData);

      try {
        const [guides, policies] = await Promise.all([
          PropertyGuide.filter({ property_id: propertyId }),
          CancellationPolicy.filter({ property_id: propertyId })
        ]);
        setPropertyGuide(guides[0] || null);
        setCancellationPolicy(policies[0] || null);
      } catch (error) {
        // Non-critical error, log it but don't crash
      }

    } catch (error) {
      navigate(createPageUrl("Properties"));
    }
    setLoading(false);
  };

  const handleGetDirections = () => {
    const { latitude, longitude } = property;
    if (!latitude || !longitude) return;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        window.open(`https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`);
    } else if (navigator.platform.toUpperCase().indexOf('MAC')>=0) {
        window.open(`https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`);
    } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
    }
  };

  const scrollToBooking = () => {
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Propiedad no encontrada</h2>
          <Button onClick={() => navigate(createPageUrl("Properties"))}>
            Volver a propiedades
          </Button>
        </div>
      </div>
    );
  }

  const images = property.images || ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop"];
  
  const crumbs = [
    { label: 'Propiedades', href: createPageUrl('Properties') },
    { label: property.title }
  ];

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <div className="flex-1">
          <Breadcrumbs crumbs={crumbs} />
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {property.title}
            </h1>
            <div className="flex items-center space-x-4 text-slate-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.location}</span>
              </div>
              {property.rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-400 fill-current mr-1" />
                  <span>{property.rating.toFixed(1)} ({property.total_reviews} reseñas)</span>
                </div>
              )}
            </div>
          </div>
          <Badge
            className={
              property.category === "Experiencia"
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }
          >
            {property.category}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              <LazyImage
                src={images[currentImageIndex]}
                alt={property.title}
                width={800}
                height={600}
                priority={true}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <LazyImage
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acerca de este lugar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-600 leading-relaxed">
                {property.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="font-medium">{property.max_guests}</div>
                    <div className="text-sm text-slate-500">Huéspedes</div>
                  </div>
                </div>

                {property.bedrooms && (
                  <div className="flex items-center space-x-2">
                    <Bed className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium">{property.bedrooms}</div>
                      <div className="text-sm text-slate-500">Dormitorios</div>
                    </div>
                  </div>
                )}

                {property.bathrooms && (
                  <div className="flex items-center space-x-2">
                    <Bath className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium">{property.bathrooms}</div>
                      <div className="text-sm text-slate-500">Baños</div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {property.structured_amenities && property.structured_amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Comodidades</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.structured_amenities.map((amenity) => {
                      const Icon = amenityIconsList[amenity.id] || Check;
                      return (
                        <div key={amenity.id} className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-green-600" />
                          <span>
                            {amenity.label}
                            {!amenity.included && amenity.price > 0 && (
                              <span className="text-xs text-slate-500 ml-1">
                                (+${amenity.price.toLocaleString()})
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator />

              {property.latitude && property.longitude && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Ubicación</h3>
                  <LazyMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    className="h-96 w-full rounded-lg mb-4"
                  />
                  <Button onClick={handleGetDirections}>
                    <Navigation className="w-4 h-4 mr-2" />
                    Cómo llegar
                  </Button>
                </div>
              )}

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Hora de entrada</h4>
                  <p className="text-slate-600">{property.check_in_time || '15:00'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Hora de salida</h4>
                  <p className="text-slate-600">{property.check_out_time || '11:00'}</p>
                </div>
              </div>

              {property.rules && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Reglas de la casa</h3>
                    <p className="text-slate-600 leading-relaxed">{property.rules}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {owner && <HostProfile host={owner} compact={true} />}

          {propertyGuide && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Guía de la Propiedad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {propertyGuide.house_rules && (
                  <div>
                    <h4 className="font-semibold mb-2">Normas de la Casa</h4>
                    <p className="text-slate-600 text-sm">{propertyGuide.house_rules}</p>
                  </div>
                )}
                {propertyGuide.check_in_instructions && (
                  <div>
                    <h4 className="font-semibold mb-2">Instrucciones de Llegada</h4>
                    <p className="text-slate-600 text-sm">{propertyGuide.check_in_instructions}</p>
                  </div>
                )}
                {propertyGuide.included_services && (
                  <div>
                    <h4 className="font-semibold mb-2">Servicios Incluidos</h4>
                    <p className="text-slate-600 text-sm">{propertyGuide.included_services}</p>
                  </div>
                )}
                {propertyGuide.local_recommendations && (
                  <div>
                    <h4 className="font-semibold mb-2">Recomendaciones Locales</h4>
                    <p className="text-slate-600 text-sm">{propertyGuide.local_recommendations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {cancellationPolicy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Política de Cancelación</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">
                    {cancellationPolicy.policy_type === 'flexible' && 'Política Flexible'}
                    {cancellationPolicy.policy_type === 'moderada' && 'Política Moderada'}
                    {cancellationPolicy.policy_type === 'estricta' && 'Política Estricta'}
                    {cancellationPolicy.policy_type === 'personalizada' && 'Política Personalizada'}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {cancellationPolicy.custom_policy}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <ReviewSection reviews={reviews} property={property} />
        </div>

        <div className="lg:col-span-1" ref={bookingFormRef}>
          <div className="sticky top-24 space-y-6">
            <BookingForm
              property={property}
              user={user}
              onBookingComplete={() => {
                loadPropertyData();
              }}
            />
            {owner && <HostProfile host={owner} />}
          </div>
        </div>
      </div>
    </div>
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t shadow-lg z-40">
        <div className="flex justify-between items-center">
            <div>
                <p className="font-bold text-lg">${property.price_per_night?.toLocaleString()}</p>
                <p className="text-sm text-slate-500">/ noche</p>
            </div>
            <Button onClick={scrollToBooking} className="btn-primary px-8">
                Reservar
            </Button>
        </div>
    </div>
    </>
  );
}
