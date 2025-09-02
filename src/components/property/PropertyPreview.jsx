import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Bed, Bath, Star, Calendar } from "lucide-react";

export default function PropertyPreview({ property }) {
  const images = property.images || [];
  const mainImage = images[0] || "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop";

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden shadow-lg">
        {/* Main Image */}
        <div className="aspect-[4/3] relative overflow-hidden">
          <img 
            src={mainImage} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-slate-800 backdrop-blur-sm">
              {property.category}
            </Badge>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4">
              <Badge className="bg-black/60 text-white">
                +{images.length - 1} fotos
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          {/* Title and Location */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {property.title}
            </h3>
            <div className="flex items-center text-slate-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.location}</span>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-slate-600 text-sm mb-4 line-clamp-3">
            {property.description}
          </p>
          
          {/* Details */}
          <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{property.max_guests} huéspedes</span>
              </div>
              {property.bedrooms > 0 && (
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{property.bedrooms} hab</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{property.bathrooms} baños</span>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          {property.structured_amenities?.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {property.structured_amenities.slice(0, 3).map(amenity => (
                  <Badge key={amenity.id} variant="outline" className="text-xs">
                    {amenity.label}
                  </Badge>
                ))}
                {property.structured_amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{property.structured_amenities.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Price and Check-in */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-slate-900">
                ${property.price_per_night?.toLocaleString()}
              </span>
              <span className="text-slate-600 text-sm"> / noche</span>
            </div>
            <div className="text-right text-sm text-slate-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{property.check_in_time} - {property.check_out_time}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t text-xs text-slate-500 space-y-1">
            <div>Política de pago: {
              property.payment_policy === 'immediate' ? 'Al reservar' :
              property.payment_policy === 'checkin' ? 'Al check-in' : '50% reserva, 50% check-in'
            }</div>
            <div>Idiomas: {property.languages?.join(', ') || 'Español'}</div>
            <div>Mascotas: {property.pet_policy === 'allowed' ? 'Permitidas' : 'No permitidas'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}