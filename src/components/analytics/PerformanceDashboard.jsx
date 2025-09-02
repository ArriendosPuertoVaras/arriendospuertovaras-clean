import React, { useState, useEffect } from "react";
import { PerformanceMetrics } from "@/api/entities";
import { SeasonalPricing } from "@/api/entities";
import { User } from "@/api/entities";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PerformanceDashboard({ entityId, entityType }) {
  const [metrics, setMetrics] = useState(null);
  const [seasonalPricing, setSeasonalPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [entityId, entityType]);

  const loadDashboardData = async () => {
    try {
      const [userData, metricsData, pricingData] = await Promise.all([
        User.me(),
        PerformanceMetrics.filter({ entity_id: entityId, entity_type: entityType }, "-created_date", 1),
        SeasonalPricing.filter({ entity_id: entityId, entity_type: entityType, active: true })
      ]);

      setUser(userData);
      setMetrics(metricsData[0] || null);
      setSeasonalPricing(pricingData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setLoading(false);
  };

  const getCurrentSeasonPricing = () => {
    const today = new Date();
    return seasonalPricing.find(season => {
      const start = new Date(season.start_date);
      const end = new Date(season.end_date);
      return today >= start && today <= end;
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentSeason = getCurrentSeasonPricing();

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reservas Totales</p>
                <p className="text-2xl font-bold">{metrics?.total_bookings || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics?.total_revenue || 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calificación Promedio</p>
                <p className="text-2xl font-bold">{metrics?.average_rating?.toFixed(1) || 'N/A'}</p>
              </div>
              <Target className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa Ocupación</p>
                <p className="text-2xl font-bold">{metrics?.occupancy_rate?.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="pricing">Precios Dinámicos</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparación con Competencia</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics?.competitor_comparison ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Precio promedio del mercado:</span>
                      <span className="font-semibold">
                        {formatCurrency(metrics.competitor_comparison.avg_market_price)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tu posición:</span>
                      <Badge variant={
                        metrics.competitor_comparison.price_position === 'above' ? 'default' :
                        metrics.competitor_comparison.price_position === 'below' ? 'secondary' : 'outline'
                      }>
                        {metrics.competitor_comparison.price_position === 'above' ? 'Por encima' :
                         metrics.competitor_comparison.price_position === 'below' ? 'Por debajo' : 'En el promedio'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cuota de mercado:</span>
                      <span className="font-semibold">
                        {(metrics.competitor_comparison.market_share * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No hay datos de competencia disponibles</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Días de Demanda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      Alta demanda
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {metrics?.peak_demand_days?.map((day, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800">
                          {day}
                        </Badge>
                      )) || <span className="text-gray-500">No hay datos</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-600 mb-2 flex items-center">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      Baja demanda
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {metrics?.low_demand_days?.map((day, index) => (
                        <Badge key={index} variant="secondary">
                          {day}
                        </Badge>
                      )) || <span className="text-gray-500">No hay datos</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Precios por Temporada</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSeason && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Temporada Actual: {currentSeason.season_name}</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Precio base:</span>
                      <span className="ml-2 font-semibold">{formatCurrency(currentSeason.base_price)}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Precio ajustado:</span>
                      <span className="ml-2 font-semibold">{formatCurrency(currentSeason.adjusted_price)}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Demanda:</span>
                      <Badge className="ml-2" variant={
                        currentSeason.demand_level === 'muy_alta' || currentSeason.demand_level === 'alta' ? 'default' : 'secondary'
                      }>
                        {currentSeason.demand_level.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {seasonalPricing.length > 0 ? (
                  seasonalPricing.map((season) => (
                    <div key={season.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{season.season_name}</h4>
                        <div className="flex items-center space-x-2">
                          {season.ai_recommended && (
                            <Badge className="bg-purple-100 text-purple-800">IA</Badge>
                          )}
                          <Badge variant="outline">
                            {((season.adjusted_price - season.base_price) / season.base_price * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Inicio:</strong> {new Date(season.start_date).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Fin:</strong> {new Date(season.end_date).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Precio base:</strong> {formatCurrency(season.base_price)}
                        </div>
                        <div>
                          <strong>Precio ajustado:</strong> {formatCurrency(season.adjusted_price)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No tienes precios dinámicos configurados</p>
                    <Button>Configurar Precios por Temporada</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Insights y Recomendaciones IA</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics?.ai_insights ? (
                <div className="prose max-w-none">
                  <p>{metrics.ai_insights}</p>
                </div>
              ) : (
                <p className="text-gray-500">No hay insights disponibles en este momento.</p>
              )}

              {metrics?.recommendations && metrics.recommendations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recomendaciones:</h4>
                  <ul className="space-y-2">
                    {metrics.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}