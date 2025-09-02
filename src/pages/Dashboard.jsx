
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Property } from "@/api/entities";
import { Service } from "@/api/entities";
import { Booking } from "@/api/entities";
import { PricingRecommendation } from "@/api/entities";
import { SmartAlert } from "@/api/entities";
import { RevenueReport } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Payment } from "@/api/entities";
import { LastMinuteOffer } from "@/api/entities";
import PerformanceDashboard from '@/components/analytics/PerformanceDashboard';
import UnifiedCalendar from '@/components/dashboard/UnifiedCalendar';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  BarChart3,
  Zap,
  Target,
  Brain,
  Download,
  Bell,
  Settings,
  ArrowUp,
  ArrowDown,
  Eye,
  Sparkles,
  Zap as ZapIcon,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import OfferSetupForm from "@/components/property/OfferSetupForm";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import AuthGuard from '@/components/auth/AuthGuard';

export default function Dashboard() { // Renamed from DashboardPage
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pricingRecommendations, setPricingRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [lastMinuteOffers, setLastMinuteOffers] = useState([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    // AuthGuard se encarga de la redirección.
    // Solo cargamos los datos si el usuario está autenticado.
    const loadInitialData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        await loadDashboardData(userData);
      } catch (error) {
        // AuthGuard ya habrá redirigido, esto es un fallback.
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const loadDashboardData = async (userData) => {
    try {
      const [userProperties, userServices, userBookings, recommendations, userAlerts, userPayments, offers] = await Promise.all([
        Property.filter({ owner_id: userData.id }),
        Service.filter({ provider_id: userData.id }),
        Booking.filter({ owner_id: userData.id }),
        PricingRecommendation.filter({ owner_id: userData.id, status: "pendiente" }),
        SmartAlert.filter({ owner_id: userData.id, read: false }),
        Payment.filter({ owner_id: userData.id, status: "completado" }),
        LastMinuteOffer.filter({ owner_id: userData.id })
      ]);

      setProperties(userProperties);
      setServices(userServices);
      setBookings(userBookings);
      setPayments(userPayments);
      setPricingRecommendations(recommendations);
      setAlerts(userAlerts);
      setLastMinuteOffers(offers);

      // Generate revenue data
      await generateRevenueData(userData, userPayments);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const generateRevenueData = async (userData, payments) => {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);

    const currentMonthPayments = payments.filter(p =>
      new Date(p.created_date).getMonth() === currentMonth.getMonth() &&
      new Date(p.created_date).getFullYear() === currentMonth.getFullYear()
    );
    const lastMonthPayments = payments.filter(p =>
      new Date(p.created_date).getMonth() === lastMonth.getMonth() &&
      new Date(p.created_date).getFullYear() === lastMonth.getFullYear()
    );

    const currentRevenue = currentMonthPayments.reduce((sum, p) => sum + (p.owner_payout || 0), 0);
    const lastRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.owner_payout || 0), 0);
    const growth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : (currentRevenue > 0 ? 100 : 0);

    setRevenueData({
      currentMonth: currentRevenue,
      lastMonth: lastRevenue,
      growth: growth,
      totalBookings: currentMonthPayments.length,
      occupancyRate: 75 // Placeholder - would be calculated from actual availability
    });
  };

  const generateAIRecommendations = async () => {
    setAiLoading(true);

    try {
      for (const property of properties) {
        const prompt = `Analiza esta propiedad en Puerto Varas para generar recomendaciones de precio:
        - Título: ${property.title}
        - Precio actual: $${property.price_per_night} CLP
        - Categoría: ${property.category}
        - Ubicación: ${property.location}
        - Capacidad: ${property.max_guests} huéspedes
        - Calificación: ${property.rating || 'Sin calificación'}

        Considera factores como temporada de verano en Chile (Dic-Mar), turismo en Puerto Varas, proximidad a lagos y volcanes.

        Devuelve una recomendación con precio sugerido y justificación de máximo 100 palabras.`;

        const result = await InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              recommended_price: { type: "number" },
              confidence_score: { type: "number" },
              reasoning: { type: "string" },
              market_demand: { type: "string" },
              potential_increase: { type: "number" }
            }
          }
        });

        await PricingRecommendation.create({
          property_id: property.id,
          owner_id: user.id,
          current_price: property.price_per_night,
          recommended_price: result.recommended_price,
          confidence_score: result.confidence_score,
          reasoning: result.reasoning,
          market_demand: result.market_demand,
          potential_revenue_increase: result.potential_increase,
          date_range_start: new Date().toISOString().split('T')[0],
          date_range_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }

      toast.success("Recomendaciones de IA generadas exitosamente");
      await loadDashboardData(user);
    } catch (error) {
      toast.error("Error generando recomendaciones");
      console.error(error);
    }

    setAiLoading(false);
  };

  const applyPricingRecommendation = async (recommendation) => {
    try {
      await Property.update(recommendation.property_id, {
        price_per_night: recommendation.recommended_price
      });

      await PricingRecommendation.update(recommendation.id, {
        status: "aplicada"
      });

      toast.success(`Precio actualizado a $${recommendation.recommended_price.toLocaleString()}`);
      await loadDashboardData(user);
    } catch (error) {
      toast.error("Error aplicando recomendación");
    }
  };

  const handleOfferSaved = async () => {
    setShowOfferForm(false);
    toast.success("Configuración de oferta guardada!");
    await loadDashboardData(user);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const crumbs = [
    { label: 'Mi Cuenta', href: createPageUrl('MiCuenta') },
    { label: 'Dashboard IA' }
  ];

  return (
    <AuthGuard hostOnly={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Inteligente</h1>
            <p className="text-slate-600">Optimiza tus ingresos con IA avanzada</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={generateAIRecommendations} disabled={aiLoading} className="bg-purple-600 hover:bg-purple-700">
              <Brain className="w-4 h-4 mr-2" />
              {aiLoading ? "Analizando..." : "Generar Recomendaciones IA"}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Ingresos Mes Actual</p>
                  <p className="text-2xl font-bold">${revenueData?.currentMonth?.toLocaleString() || 0}</p>
                </div>
                <div className="flex items-center">
                  {revenueData?.growth > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ml-1 ${revenueData?.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(revenueData?.growth || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Tasa de Ocupación</p>
                  <p className="text-2xl font-bold">{revenueData?.occupancyRate || 0}%</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Transacciones Este Mes</p>
                  <p className="text-2xl font-bold">{revenueData?.totalBookings || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Alertas Activas</p>
                  <p className="text-2xl font-bold">{alerts.length}</p>
                </div>
                <Bell className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="recommendations">Recomendaciones IA</TabsTrigger>
            <TabsTrigger value="alerts">Alertas Inteligentes</TabsTrigger>
            <TabsTrigger value="calendar">Calendario Unificado</TabsTrigger>
            <TabsTrigger value="analytics">Análisis de Propiedades</TabsTrigger>
            <TabsTrigger value="reports">Reportes Financieros</TabsTrigger>
            <TabsTrigger value="deals">Tómalo o Déjalo</TabsTrigger>
          </TabsList>

          {/* AI Pricing Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span>Recomendaciones de Precio Inteligentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricingRecommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No hay recomendaciones disponibles</p>
                    <p className="text-sm text-slate-500 mb-4">Genera recomendaciones con IA para optimizar tus precios</p>
                    <Button onClick={generateAIRecommendations} disabled={aiLoading} className="bg-purple-600 hover:bg-purple-700">
                      <Brain className="w-4 h-4 mr-2" />
                      Generar Recomendaciones
                    </Button>
                  </div>
                ) : (
                  pricingRecommendations.map((rec) => {
                    const property = properties.find(p => p.id === rec.property_id);
                    return (
                      <Card key={rec.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-lg">{property?.title}</h4>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-slate-600">
                                  Precio actual: <span className="font-medium">${rec.current_price.toLocaleString()}</span>
                                </span>
                                <span className="text-sm text-green-600">
                                  Precio sugerido: <span className="font-medium">${rec.recommended_price.toLocaleString()}</span>
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-purple-100 text-purple-800 mb-2">
                                {rec.confidence_score}% confianza
                              </Badge>
                              <div className="text-sm text-green-600 font-medium">
                                +{rec.potential_revenue_increase}% ingresos
                              </div>
                            </div>
                          </div>

                          <p className="text-slate-600 mb-4">{rec.reasoning}</p>

                          <div className="flex justify-between items-center">
                            <Button onClick={() => applyPricingRecommendation(rec)} className="bg-purple-600 hover:bg-purple-700">
                              <Zap className="w-4 h-4 mr-2" />
                              Aplicar Precio
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Smart Alerts */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span>Alertas Inteligentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No tienes alertas pendientes</p>
                    <p className="text-sm text-slate-500">Te notificaremos sobre oportunidades importantes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <Alert key={alert.id} className={`border-l-4 ${
                        alert.priority === 'crítica' ? 'border-l-red-500' :
                        alert.priority === 'alta' ? 'border-l-orange-500' :
                        alert.priority === 'media' ? 'border-l-yellow-500' : 'border-l-blue-500'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{alert.title}</h4>
                              <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                              {alert.action_recommended && (
                                <p className="text-sm text-blue-600 mt-2 font-medium">
                                  💡 {alert.action_recommended}
                                </p>
                              )}
                            </div>
                            <Badge variant={
                              alert.priority === 'crítica' ? 'destructive' :
                              alert.priority === 'alta' ? 'default' : 'secondary'
                            }>
                              {alert.priority}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nueva pestaña: Calendario Unificado */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span>Calendario Unificado - Gestión de Reservas y Recursos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UnifiedCalendar
                  operatorId={user?.id}
                  isOperatorView={true}
                  properties={properties}
                  services={services}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <span>Análisis de Propiedades</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {properties.map((property) => (
                    <Card key={property.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{property.title}</h4>
                            <p className="text-sm text-slate-600">{property.location}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Análisis Completo
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Optimización SEO</p>
                            <Progress value={75} className="mt-2" />
                            <span className="text-sm text-slate-500">75/100</span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Calidad de Fotos</p>
                            <Progress value={60} className="mt-2" />
                            <span className="text-sm text-slate-500">60/100</span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Descripción</p>
                            <Progress value={85} className="mt-2" />
                            <span className="text-sm text-slate-500">85/100</span>
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-2">💡 Sugerencias de Mejora</h5>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Agregar más fotos del exterior y áreas comunes</li>
                            <li>• Incluir palabras clave como "vista lago" y "volcán Osorno"</li>
                            <li>• Destacar la cercanía a actividades de aventura</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-500" />
                  <span>Reportes de Pagos</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline"><Download className="w-4 h-4 mr-2"/>Exportar a PDF</Button>
                  <Button variant="outline"><Download className="w-4 h-4 mr-2"/>Exportar a Excel</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Fecha</th>
                        <th scope="col" className="px-6 py-3">Subtotal</th>
                        <th scope="col" className="px-6 py-3">Comisión (12%)</th>
                        <th scope="col" className="px-6 py-3">IVA Comisión</th>
                        <th scope="col" className="px-6 py-3">Pago Recibido</th>
                        <th scope="col" className="px-6 py-3">Método Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="bg-white border-b">
                          <td className="px-6 py-4">{new Date(p.created_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">${p.subtotal?.toLocaleString() || '0'}</td>
                          <td className="px-6 py-4 text-red-600">-${p.commission_amount?.toLocaleString() || '0'}</td>
                          <td className="px-6 py-4">${p.iva_on_commission?.toLocaleString() || '0'}</td>
                          <td className="px-6 py-4 font-semibold text-green-600">${p.owner_payout?.toLocaleString() || '0'}</td>
                          <td className="px-6 py-4">{p.payment_method || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tómalo o Déjalo */}
          <TabsContent value="deals" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ZapIcon className="w-5 h-5 text-red-500" />
                  <span>Gestionar Ofertas "Tómalo o Déjalo"</span>
                </CardTitle>
                <Button onClick={() => setShowOfferForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Configurar Nueva Oferta
                </Button>
              </CardHeader>
              <CardContent>
                {showOfferForm && (
                  <OfferSetupForm
                    properties={properties}
                    onSave={handleOfferSaved}
                    onCancel={() => setShowOfferForm(false)}
                    ownerId={user.id}
                  />
                )}

                <div className="mt-6 space-y-4">
                  <h4 className="text-lg font-medium">Tus Ofertas Activas/Configuradas</h4>
                  {lastMinuteOffers.length === 0 ? (
                    <p className="text-slate-500">No tienes ofertas configuradas. ¡Crea una para llenar espacios vacíos!</p>
                  ) : (
                    lastMinuteOffers.map(offer => {
                      const property = properties.find(p => p.id === offer.property_id);
                      return (
                        <Card key={offer.id} className="border-l-4 border-red-500">
                          <CardContent className="p-4">
                            <p><strong>{property?.title}</strong> - {offer.status}</p>
                            <p>Descuento: {offer.discount_percentage}%</p>
                            <p>Se activa {offer.activation_window_hours}h antes.</p>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
