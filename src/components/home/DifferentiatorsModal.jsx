import React from 'react';
import { Rocket, Users, Award, CalendarCheck, Package, DollarSign, Map, ShieldCheck, Bot, Sparkles, Phone } from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, children, iconBgColor = 'bg-yellow-100', iconTextColor = 'text-yellow-700' }) => (
  <div className="flex items-start gap-4">
    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${iconBgColor} ${iconTextColor} flex items-center justify-center`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h4 className="font-semibold text-slate-800">{title}</h4>
      <p className="text-slate-600 text-sm">{children}</p>
    </div>
  </div>
);

export default function DifferentiatorsModalContent() {
  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">¿Qué nos hace diferentes?</h2>
        <p className="text-slate-600 mt-2 max-w-3xl mx-auto">
          En Arriendos Puerto Varas no somos solo un marketplace:
          somos un ecosistema inteligente que conecta propietarios, operadores y turistas en un mismo lugar, <strong>impulsando el desarrollo local y creando experiencias auténticas.</strong>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-blue-600" />
            Para Anfitriones y Operadores
          </h3>
          <div className="space-y-5">
            <FeatureItem icon={Rocket} title="Gestión Inteligente con IA" iconBgColor="bg-blue-100" iconTextColor="text-blue-700">
              Recomendaciones de precios, alertas de demanda y reportes financieros claros para maximizar tus ingresos.
            </FeatureItem>
            <FeatureItem icon={CalendarCheck} title="Calendario Unificado sin Complicaciones" iconBgColor="bg-blue-100" iconTextColor="text-blue-700">
              Sincronización automática con Airbnb y Booking para evitar dobles reservas y simplificar tu operación diaria.
            </FeatureItem>
            <FeatureItem icon={Package} title="Paquetes Dinámicos Exclusivos" iconBgColor="bg-blue-100" iconTextColor="text-blue-700">
              Combina propiedades y servicios locales en experiencias integrales que atraen más clientes y aumentan tus ventas.
            </FeatureItem>
            <FeatureItem icon={DollarSign} title="Cero Costos Iniciales" iconBgColor="bg-blue-100" iconTextColor="text-blue-700">
              Publicar es gratis; solo pagas una comisión justa si concretas una venta.
            </FeatureItem>
             <FeatureItem icon={Users} title="Parte de una Comunidad Activa" iconBgColor="bg-blue-100" iconTextColor="text-blue-700">
              Únete a una red de profesionales locales comprometidos con el crecimiento turístico y la colaboración mutua.
            </FeatureItem>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Para Viajeros y Residentes
          </h3>
          <div className="space-y-5">
            <FeatureItem icon={Map} title="Todo en un Solo Lugar" iconBgColor="bg-purple-100" iconTextColor="text-purple-700">
              Accede a una amplia variedad de alojamientos verificados, experiencias, tours, transporte y servicios esenciales de Puerto Varas.
            </FeatureItem>
            <FeatureItem icon={ShieldCheck} title="Confianza y Transparencia" iconBgColor="bg-purple-100" iconTextColor="text-purple-700">
              Reseñas verificadas y pagos seguros para una elección informada y protegida en cada paso.
            </FeatureItem>
            <FeatureItem icon={Bot} title="Asistente AI “Jaime” 24/7" iconBgColor="bg-purple-100" iconTextColor="text-purple-700">
              Recibe recomendaciones personalizadas de clima, actividades y planes en tiempo real para una estadía perfecta.
            </FeatureItem>
             <FeatureItem icon={Phone} title="Soporte Local Real" iconBgColor="bg-purple-100" iconTextColor="text-purple-700">
              Obtén ayuda inmediata y personalizada en Puerto Varas si algo no sale como esperabas, con la cercanía que necesitas.
            </FeatureItem>
             <FeatureItem icon={Users} title="Vive la Autenticidad Local" iconBgColor="bg-purple-100" iconTextColor="text-purple-700">
              Conecta directamente con la cultura y los emprendedores de Puerto Varas, viviendo experiencias genuinas.
            </FeatureItem>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-100 rounded-lg p-4 mt-8 text-center">
        <p className="text-slate-800 font-semibold">
          En pocas palabras:
        </p>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Otras plataformas solo intermedian. Nosotros unificamos a todos los actores del turismo en un solo dashboard con inteligencia artificial, generando más reservas, experiencias personalizadas y <strong>una colaboración local que beneficia a todos.</strong>
        </p>
      </div>
    </div>
  );
}