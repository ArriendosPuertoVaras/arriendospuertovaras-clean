
import React from "react";
import { CheckCircle, Users, Target, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { setPageMeta, generateStructuredData, insertStructuredData, setDefaultMeta } from "@/components/utils/seo";
import { useEffect } from "react";

export default function QuienesSomosPage() {
  useEffect(() => {
    setDefaultMeta('quienes-somos');

    // Insert LocalBusiness structured data
    const structuredData = generateStructuredData('localbusiness');
    insertStructuredData(structuredData);
  }, []);

  return (
    <div className="bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Quiénes Somos
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Una plataforma local comprometida con el turismo y la economía de Puerto Varas
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
          <div className="space-y-6">
            <div className="prose prose-lg text-slate-700 max-w-none">
              <p className="text-lg leading-relaxed">
                En ArriendosPuertoVaras.cl somos una plataforma local dedicada a conectar a propietarios, anfitriones y prestadores de servicios con viajeros y residentes que buscan experiencias únicas en Puerto Varas y sus alrededores.
              </p>
              <p className="text-lg leading-relaxed">
                Nacimos con el propósito de impulsar la economía local y facilitar el arriendo de propiedades y servicios de forma rápida, segura y directa, sin procesos complicados. Queremos que tanto anfitriones como clientes encuentren en un solo lugar todo lo que necesitan para disfrutar de nuestra ciudad y la belleza del sur de Chile.
              </p>
              <p className="text-lg leading-relaxed">
                Nuestro equipo está formado por personas que viven y conocen Puerto Varas, comprometidas con la calidad, transparencia y hospitalidad que caracteriza a nuestra comunidad.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Nuestro Equipo
              </h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Formado por profesionales locales que conocen Puerto Varas desde adentro. Cada miembro de nuestro equipo vive aquí y está comprometido con hacer de esta ciudad un destino aún más especial.
            </p>
          </div>
        </div>

        {/* Lo que nos diferencia */}
        <Card className="mb-16 shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                📍 Lo que nos diferencia
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  "Especialización en Puerto Varas y alrededores.",
                  "Publicación gratuita para propiedades y servicios.",
                  "Sincronización de calendarios con Airbnb y Booking.com.",
                  "Conexión entre operadores para armar paquetes turísticos automáticos, donde todos estarán vinculados tanto en el itinerario como en el calendario del operador."
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                    <span className="text-slate-700 text-lg">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {[
                  "Creación de una comunidad operativa local, trabajando en conjunto para mejorar la experiencia del turista.",
                  "Herramientas con inteligencia artificial que permiten a los operadores tener control total de su negocio y tomar mejores decisiones a futuro.",
                  "Soporte local y respuesta rápida."
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                    <span className="text-slate-700 text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nuestra Misión */}
        <div className="bg-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Nuestra Misión
          </h2>
          <p className="text-xl leading-relaxed max-w-4xl mx-auto opacity-95">
            Conectar personas y oportunidades para que cada arriendo, reserva o servicio contratado sea una experiencia positiva, segura e inolvidable, potenciando la colaboración entre quienes hacen posible el turismo en nuestra región.
          </p>
        </div>

        {/* Compromiso Local */}
        <div className="mt-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Compromiso con Puerto Varas
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Creemos firmemente que el turismo debe beneficiar a toda la comunidad. Por eso, cada funcionalidad de nuestra plataforma está diseñada para fortalecer la economía local y crear vínculos genuinos entre visitantes y residentes.
          </p>
        </div>
      </div>
    </div>
  );
}
