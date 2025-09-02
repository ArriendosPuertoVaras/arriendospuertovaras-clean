import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  MessageCircle, 
  Clock, 
  Award, 
  MapPin,
  Globe,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HostProfile({ host, compact = false }) {
  if (!host) return null;

  const languages = host.languages || ['Español'];
  const responseTime = host.average_response_time || 2;
  const memberSince = host.hosting_since ? new Date(host.hosting_since).getFullYear() : new Date(host.created_date).getFullYear();

  if (compact) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={host.profile_image} alt={host.full_name} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                {host.full_name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold">{host.full_name}</h3>
                {host.superhost && (
                  <Badge className="bg-red-100 text-red-800">
                    <Award className="w-3 h-3 mr-1" />
                    Superanfitrión
                  </Badge>
                )}
                {host.verified && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-400 fill-current mr-1" />
                  <span>{host.rating > 0 ? host.rating.toFixed(1) : 'Nuevo'}</span>
                  {host.total_reviews > 0 && <span className="ml-1">({host.total_reviews} reseñas)</span>}
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Responde en {responseTime}h</span>
                </div>
                
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  <span>{languages.slice(0, 2).join(', ')}</span>
                </div>
              </div>
              
              {host.bio && (
                <p className="text-sm text-slate-600 line-clamp-2">{host.bio}</p>
              )}
            </div>
            
            <div className="text-right">
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={host.profile_image} alt={host.full_name} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
              {host.full_name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h3 className="text-xl font-semibold">{host.full_name}</h3>
            {host.verified && <CheckCircle className="w-5 h-5 text-green-600" />}
          </div>
          
          {host.superhost && (
            <Badge className="bg-red-100 text-red-800 mb-3">
              <Award className="w-4 h-4 mr-1" />
              Superanfitrión
            </Badge>
          )}
          
          <div className="flex items-center justify-center space-x-1 mb-3">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="font-medium">
              {host.rating > 0 ? host.rating.toFixed(1) : 'Nuevo anfitrión'}
            </span>
            {host.total_reviews > 0 && (
              <span className="text-slate-500">({host.total_reviews} reseñas)</span>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Tiempo de respuesta:</span>
            <span className="font-medium">{responseTime} horas</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Anfitrión desde:</span>
            <span className="font-medium">{memberSince}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Idiomas:</span>
            <span className="font-medium">{languages.join(', ')}</span>
          </div>
          
          {host.location && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Ubicación:</span>
              <span className="font-medium flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {host.location}
              </span>
            </div>
          )}
        </div>

        {host.bio && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Acerca de {host.full_name?.split(' ')[0]}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{host.bio}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar mensaje
          </Button>
          
          <Link to={createPageUrl("HostProperties") + `?host=${host.id}`}>
            <Button variant="outline" className="w-full">
              Ver todas las propiedades ({host.property_count || 0})
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}