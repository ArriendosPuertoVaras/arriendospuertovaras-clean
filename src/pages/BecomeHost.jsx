
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { HostLead } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Home, 
  Car, 
  Wrench, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Calendar,
  Shield,
  Plus, // New from outline
  ChevronRight, // New from outline
  Star, // New from outline
  TrendingUp // New from outline
} from "lucide-react";
import BackButton from '@/components/ui/BackButton'; // New import

export default function BecomeHostPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    listing_type: '',
    city: '',
    message: '',
    privacy_accepted: false
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.privacy_accepted) {
      toast.error("Debes aceptar la política de privacidad");
      return;
    }

    setLoading(true);
    
    try {
      await HostLead.create(formData);
      setSubmitted(true);
      toast.success("¡Solicitud enviada! Te contactaremos pronto.");
    } catch (error) {
      console.error("Error sending lead:", error);
      toast.error("Error al enviar la solicitud. Inténtalo nuevamente.");
    }
    
    setLoading(false);
  };

  const handleStartPublishing = async () => {
    try {
      // Check if user is logged in
      const userData = await User.me();
      
      if (userData.user_type !== 'arrendador') {
        await User.updateMyUserData({ user_type: 'arrendador' });
      }
      
      navigate(createPageUrl("HostWizard"));
    } catch (error) {
      // User not logged in, redirect to login
      await User.loginWithRedirect(createPageUrl("HostWizard"));
    }
  };

  const listingTypes = [
    { value: 'property', label: 'Propiedad (cabaña, depto, casa)', icon: Home },
    { value: 'vehicle', label: 'Vehículo', icon: Car },
    { value: 'service', label: 'Servicio', icon: Wrench },
    { value: 'experience', label: 'Experiencia', icon: Sparkles }
  ];

  const benefits = [
    { icon: DollarSign, title: "Ingresos Extra", description: "Genera ingresos desde el primer mes" },
    { icon: Users, title: "Comunidad", description: "Únete a cientos de anfitriones exitosos" },
    { icon: Calendar, title: "Control Total", description: "Tú decides cuándo y cómo" },
    { icon: Shield, title: "Seguridad", description: "Verificación de huéspedes y seguros" }
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          ¡Solicitud Enviada!
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Gracias por tu interés. Nuestro equipo se pondrá en contacto contigo dentro de las próximas 24 horas para ayudarte a publicar tu anuncio.
        </p>
        <div className="space-y-4">
          <Button onClick={handleStartPublishing} className="btn-primary">
            <ArrowRight className="w-5 h-5 mr-2" />
            Publicar Ahora (Avanzado)
          </Button>
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(createPageUrl("Home"))}
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with improved contrast */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/80"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="flex justify-start mb-8">
            <BackButton className="text-white border-white/30 hover:bg-white/10" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Conviértete en Anfitrión
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white max-w-3xl mx-auto">
            Únete a cientos de anfitriones exitosos y comienza a generar ingresos extra hoy mismo
          </p>
          {/* No existing "stats cards and CTA button" in the original Hero, so nothing to preserve here */}
        </div>
      </section>

      {/* Benefits con mejor contraste */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900">{benefit.title}</h3>
                <p className="text-slate-700">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Form con mejor contraste */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Comienza en 2 Minutos
            </h2>
            <p className="text-xl text-slate-700">
              Cuéntanos qué quieres publicar y te ayudamos con el resto
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Solicitar Información</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre y apellido *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Tu nombre completo"
                      required
                      maxLength={80}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="tu@correo.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad / Comuna *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Ej. Puerto Varas"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="listing_type">¿Qué quieres publicar? *</Label>
                  <Select value={formData.listing_type} onValueChange={(value) => handleInputChange('listing_type', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {listingTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Cuéntanos brevemente *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tipo de anuncio, disponibilidad y cualquier detalle relevante"
                    required
                    minLength={10}
                    maxLength={800}
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={formData.privacy_accepted}
                    onCheckedChange={(checked) => handleInputChange('privacy_accepted', checked)}
                    required
                  />
                  <Label htmlFor="privacy" className="text-sm">
                    Acepto la <a href={createPageUrl("PrivacyPolicy")} target="_blank" className="text-blue-600 hover:underline">Política de privacidad</a>
                  </Label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="submit" 
                    className="btn-primary flex-1" 
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Quiero publicar"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleStartPublishing}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Publicar Ahora
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section con mejor contraste */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-lg">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8 text-white/95 drop-shadow-md">
            Únete a cientos de anfitriones que ya generan ingresos con su espacio
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-slate-100 font-semibold px-8 py-3 rounded-lg shadow-lg"
            onClick={handleStartPublishing}
          >
            Crear Anuncio Completo
          </Button>
        </div>
      </section>
    </div>
  );
}
