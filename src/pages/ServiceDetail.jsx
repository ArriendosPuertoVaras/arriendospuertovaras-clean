import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ProfessionalService } from "@/api/entities";
import { User } from "@/api/entities";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Shield,
  CheckCircle,
  ArrowLeft,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LazyImage from "@/components/ui/LazyImage";
import ServiceBookingForm from "@/components/services/ServiceBookingForm";
import {
  setPageMeta,
  generateStructuredData,
  insertStructuredData,
} from "@/components/utils/seo";

/* =========================
   Helpers SEO
   ========================= */

// Normaliza URL canónica a https y sin www
function normalizeCanonical(rawUrl) {
  try {
    const u = new URL(rawUrl);
    u.protocol = "https:";
    u.hostname = u.hostname.replace(/^www\./i, "");
    return u.toString();
  } catch {
    return rawUrl;
  }
}

// Quita HTML y deja texto plano
function stripHtml(html = "") {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Construye título y descripción
function buildSeoFromService(svc) {
  const titleBase = "Servicios en Puerto Varas";
  const title = svc?.title
    ? `${svc.title} | ${titleBase}`
    : `Servicio | ${titleBase}`;

  const raw =
    svc?.short_description ||
    svc?.description ||
    "Reserva servicios verificados en Puerto Varas — calidad y confianza para tu hogar y negocio.";
  // Sanitiza y limita a ~160
  const clean = stripHtml(raw).replace(/\s+/g, " ").trim();
  const description = clean.length > 160 ? `${clean.slice(0, 157)}…` : clean;

  const ogImage = Array.isArray(svc?.images) && svc.images.length > 0 ? svc.images[0] : undefined;

  return { title, description, ogImage };
}

// Aplica noindex (para estados 404/empty)
function setNoIndexRobots() {
  let el = document.querySelector('meta[name="robots"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "robots");
    document.head.appendChild(el);
  }
  el.setAttribute("content", "noindex, follow");
}

/* =========================
   Página
   ========================= */

export default function ServiceDetailPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const serviceSlug = urlParams.get("slug");

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      // usuario (si está logeado)
      const me = await User.me().catch(() => null);
      if (!mounted) return;
      setUser(me);

      // si no hay slug -> noindex suave y fin
      if (!serviceSlug) {
        const canonical = normalizeCanonical(window.location.href);
        setPageMeta(
          "Servicio | Servicios en Puerto Varas",
          "Reserva servicios verificados en Puerto Varas — calidad y confianza para tu hogar y negocio.",
          canonical
        );
        setNoIndexRobots();
        setLoading(false);
        return;
      }

      // carga servicio
      try {
        const list = await ProfessionalService.filter({ slug: serviceSlug });
        if (!mounted) return;

        if (Array.isArray(list) && list.length > 0) {
          const svc = list[0];
          setService(svc);

          // SEO
          const { title, description, ogImage } = buildSeoFromService(svc);
          const canonical = normalizeCanonical(window.location.href);
          setPageMeta(title, description, canonical, ogImage);

          // JSON-LD
          try {
            const data = generateStructuredData("service", svc);
            insertStructuredData(data);
          } catch (e) {
            console.warn("Structured data generation failed:", e);
          }

          // provider
          const providers = await User.filter({ id: svc.provider_id }).catch(() => []);
          if (!mounted) return;
          if (providers && providers.length > 0) setProvider(providers[0]);
        } else {
          // no encontrado: noindex
          const canonical = normalizeCanonical(window.location.href);
          setPageMeta(
            "Servicio no encontrado | Servicios en Puerto Varas",
            "Lo sentimos, el servicio solicitado no está disponible.",
            canonical
          );
          setNoIndexRobots();
        }
      } catch (err) {
        console.error("Error loading service data:", err);
        const canonical = normalizeCanonical(window.location.href);
        setPageMeta(
          "Servicio | Servicios en Puerto Varas",
          "Reserva servicios verificados en Puerto Varas — calidad y confianza para tu hogar y negocio.",
          canonical
        );
      }

      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [serviceSlug]);

  const handleBookingClick = async () => {
    if (!user) {
      await User.loginWithRedirect(window.location.href);
      return;
    }
    setShowBookingForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Servicio no encontrado</h1>
        <Button onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span>Servicios</span>
          <span>/</span>
          <span>{service.category_slug?.replace?.("-", " ") || "categoría"}</span>
          <span>/</span>
          <span className="text-gray-900">{service.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="aspect-[16/9] rounded-xl overflow-hidden">
                <LazyImage
                  src={
                    service.images?.[0] ||
                    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=450&fit=crop"
                  }
                  alt={service.title}
                  className="w-full h-full object-cover"
                  width={800}
                  height={450}
                  priority={true}
                />
              </div>
              {service.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {service.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <LazyImage
                        src={image}
                        alt={`${service.title} - imagen ${index + 2}`}
                        className="w-full h-full object-cover"
                        width={200}
                        height={200}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                  <div className="flex items-center space-x-4">
                    {service.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-amber-400 fill-current" />
                        <span className="font-medium">{service.rating.toFixed(1)}</span>
                        <span className="text-gray-600">({service.total_reviews} reseñas)</span>
                      </div>
                    )}
                    <Badge variant="outline">
                      {service.total_bookings} servicios realizados
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    $
                    {service.price_per_hour?.toLocaleString() ||
                      service.price_per_service?.toLocaleString()}
                  </div>
                  <div className="text-gray-600">
                    {service.pricing_model === "por_hora"
                      ? "por hora"
                      : service.pricing_model === "por_dia"
                      ? "por día"
                      : "precio fijo"}
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{service.description}</p>
              </div>

              {/* Service Details */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Detalles del Servicio</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>Duración mínima: {service.min_duration_hours} hora(s)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>Disponible: {service.available_days?.join(", ")}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>Cobertura: {service.coverage_areas?.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Políticas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span>Cancelación {service.cancellation_policy}</span>
                    </div>
                    {service.weather_dependent && (
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <span>Reprogramación por clima incluida</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Extras */}
              {service.extras && service.extras.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Servicios Adicionales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {service.extras.map((extra, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>{extra.name}</span>
                        </div>
                        <span className="font-medium">
                          {extra.included ? "Incluido" : `+$${extra.price?.toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Provider Info */}
            {provider && (
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sobre el Proveedor</h2>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {provider.profile_image ? (
                      <img
                        src={provider.profile_image}
                        alt={provider.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{provider.full_name}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      {provider.rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span>
                            {provider.rating.toFixed(1)} ({provider.total_reviews} reseñas)
                          </span>
                        </div>
                      )}
                      <span className="text-gray-600">
                        Activo desde {new Date(provider.created_date).getFullYear()}
                      </span>
                    </div>
                    {provider.bio && <p className="text-gray-700 mt-4">{provider.bio}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Reservar Servicio</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        $
                        {service.price_per_hour?.toLocaleString() ||
                          service.price_per_service?.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {service.pricing_model === "por_hora"
                          ? "por hora"
                          : service.pricing_model === "por_dia"
                          ? "por día"
                          : "precio fijo"}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showBookingForm ? (
                    <ServiceBookingForm
                      service={service}
                      user={user}
                      onCancel={() => setShowBookingForm(false)}
                    />
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
                      onClick={handleBookingClick}
                    >
                      Ver Disponibilidad
                    </Button>
                  )}

                  <div className="mt-6 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Confirmación inmediata</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Pago seguro</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>Proveedor verificado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
