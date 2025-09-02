import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { OperatorProfile } from "@/api/entities";
import { UnifiedBooking } from "@/api/entities";
import { CommissionLedger } from "@/api/entities";
import { createPageUrl } from "@/utils";
import UnifiedCalendar from "@/components/dashboard/UnifiedCalendar";
import PackageToggle from "@/components/dashboard/PackageToggle";
import CommissionDrawer from "@/components/dashboard/CommissionDrawer";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Settings,
  Package,
  AlertTriangle,
  BarChart3,
  Zap,
  Target,
  Brain,
  Download,
  Bell,
  ArrowUp,
  ArrowDown,
  Eye,
  Sparkles,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function UnifiedDashboardPage() {
  const [user, setUser] = useState(null);
  const [operatorProfile, setOperatorProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOperator, setIsOperator] = useState(false);
  const [showCommissionDrawer, setShowCommissionDrawer] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        setIsOperator(userData.user_type === 'arrendador' || userData.role === 'admin');

        if (userData.user_type === 'arrendador' || userData.role === 'admin') {
          await loadOperatorData(userData);
        } else {
          await loadCustomerData(userData);
        }
      } catch (error) {
        await User.loginWithRedirect(createPageUrl('UnifiedDashboard'));
      }
      setLoading(false);
    };

    checkAuthAndLoadData();
  }, []);

  const loadOperatorData = async (userData) => {
    try {
      // Cargar perfil de operador
      const profiles = await OperatorProfile.filter({ user_id: userData.id });
      let profile = profiles[0];
      
      if (!profile) {
        // Crear perfil por defecto si no existe
        profile = await OperatorProfile.create({
          user_id: userData.id,
          business_name: userData.full_name || "Mi Negocio",
          resources: [],
          package_participation: false,
          default_discount_pct: 20
        });
      }
      setOperatorProfile(profile);

      // Cargar estadísticas
      const bookings = await UnifiedBooking.filter({ operator_id: userData.id });
      const commissions = await CommissionLedger.filter({ operator_id: userData.id });
      
      const stats = {
        totalBookings: bookings.length,
        totalRevenue: commissions.reduce((sum, c) => sum + (c.operator_payout || 0), 0),
        avgRating: profile.rating || 0,
        responseRate: profile.response_rate || 0,
        completionRate: profile.completion_rate || 0,
        activeResources: profile.resources?.length || 0
      };
      
      setDashboardStats(stats);
    } catch (error) {
      console.error("Error loading operator data:", error);
    }
  };

  const loadCustomerData = async (userData) => {
    try {
      const bookings = await UnifiedBooking.filter({ user_id: userData.id });
      const stats = {
        totalBookings: bookings.length,
        upcomingBookings: bookings.filter(b => new Date(b.start_at) > new Date()).length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        totalSpent: bookings.reduce((sum, b) => sum + (b.price_net || 0), 0)
      };
      
      setDashboardStats(stats);
    } catch (error) {
      console.error("Error loading customer data:", error);
    }
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
    { label: isOperator ? 'Dashboard Operador' : 'Mi Itinerario' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs crumbs={crumbs} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          {isOperator ? 'Dashboard Inteligente - Operador' : 'Mi Itinerario Unificado'}
        </h1>
        <p className="text-xl text-slate-600">
          {isOperator 
            ? 'Gestiona tus recursos, reservas y participa en paquetes dinámicos'
            : 'Visualiza y gestiona todas tus reservas en un solo lugar'
          }
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isOperator ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Reservas Totales</p>
                    <p className="text-2xl font-bold">{dashboardStats.totalBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Ingresos Totales</p>
                    <p className="text-2xl font-bold">${dashboardStats.totalRevenue?.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Rating Promedio</p>
                    <p className="text-2xl font-bold">{dashboardStats.avgRating?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Recursos Activos</p>
                    <p className="text-2xl font-bold">{dashboardStats.activeResources}</p>
                  </div>
                  <Settings className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Reservas Próximas</p>
                    <p className="text-2xl font-bold">{dashboardStats.upcomingBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Reservas Completadas</p>
                    <p className="text-2xl font-bold">{dashboardStats.completedBookings}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Gastado</p>
                    <p className="text-2xl font-bold">${dashboardStats.totalSpent?.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Reservas Totales</p>
                    <p className="text-2xl font-bold">{dashboardStats.totalBookings}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Panel de calidad para operadores */}
      {isOperator && operatorProfile && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Panel de Calidad</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {operatorProfile.response_rate?.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Tasa de Respuesta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {operatorProfile.completion_rate?.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Tasa de Cumplimiento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {operatorProfile.response_time_hours}h
                </div>
                <div className="text-sm text-gray-600">Tiempo de Respuesta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {operatorProfile.cancellation_rate?.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Tasa de Cancelación</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido principal */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">
            {isOperator ? 'Calendario Unificado' : 'Mi Itinerario'}
          </TabsTrigger>
          {isOperator && <TabsTrigger value="packages">Paquetes Dinámicos</TabsTrigger>}
          <TabsTrigger value="commissions">
            {isOperator ? 'Comisiones' : 'Resumen Financiero'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>
                {isOperator ? 'Vista Unificada de Reservas y Tareas' : 'Mi Itinerario Completo'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedCalendar 
                operatorId={isOperator ? user?.id : null}
                isOperatorView={isOperator}
                properties={[]}
                services={[]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {isOperator && (
          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Participación en Paquetes Dinámicos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PackageToggle 
                  operatorProfile={operatorProfile}
                  onUpdate={() => loadOperatorData(user)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {isOperator ? 'Historial de Comisiones' : 'Resumen de Gastos'}
                </span>
                <Button 
                  variant="outline"
                  onClick={() => setShowCommissionDrawer(true)}
                >
                  Ver Detalles
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {isOperator 
                    ? 'Historial detallado de comisiones y pagos'
                    : 'Desglose detallado de tus gastos'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Commission Drawer */}
      {showCommissionDrawer && (
        <CommissionDrawer
          isOpen={showCommissionDrawer}
          onClose={() => setShowCommissionDrawer(false)}
          viewMode={isOperator ? "operator" : "customer"}
          userId={user?.id}
        />
      )}
    </div>
  );
}