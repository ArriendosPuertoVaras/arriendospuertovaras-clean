
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-800">Términos y Condiciones de Uso</CardTitle>
            <p className="text-slate-500">Última actualización: 9 de Agosto de 2024</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              Bienvenido a ArriendosPuertoVaras.cl. Al utilizar nuestra plataforma para reservar propiedades, vehículos o actividades, usted acepta los siguientes términos y condiciones. Por favor, léalos detenidamente.
            </p>

            <h2 className="text-2xl font-semibold mt-6">1. Estructura de Precios y Pagos</h2>
            <p>
              Los precios mostrados para cada propiedad o servicio son establecidos por el anfitrión u operador. Sobre este subtotal, ArriendosPuertoVaras.cl cobra una tarifa de servicio del 15% por el uso de la plataforma. A esta tarifa de servicio se le aplica el Impuesto al Valor Agregado (IVA) del 19%. El monto total que usted paga incluye el costo del arriendo, la tarifa de servicio y el IVA correspondiente a dicha tarifa.
            </p>

            <h2 className="text-2xl font-semibold mt-6">2. Aceptación de los Términos</h2>
            <p>
              Al completar una reserva, usted confirma que ha leído, entendido y aceptado estar legalmente obligado por estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.
            </p>

            <h2 className="text-2xl font-semibold mt-6">3. Responsabilidad por Daños</h2>
            <p>
              El arrendatario es total y exclusivamente responsable de cualquier daño, pérdida o rotura causada a la propiedad, su mobiliario, o a las instalaciones durante el período de su estancia. Esto incluye daños causados por el arrendatario o cualquiera de sus acompañantes. El arrendador se reserva el derecho de cobrar al arrendatario por dichos daños.
            </p>

            <h2 className="text-2xl font-semibold mt-6">4. Reserva No Garantizada hasta Confirmación</h2>
            <p>
              Realizar una solicitud de reserva y el correspondiente pago no garantiza la disponibilidad inmediata de la propiedad o servicio. Todas las reservas están sujetas a la confirmación final por parte del arrendador. Si el arrendador rechaza la reserva, se procederá al reembolso completo del monto pagado.
            </p>

            <h2 className="text-2xl font-semibold mt-6">5. Política de Cancelación y Reembolso</h2>
            <p>
              Las políticas de cancelación son establecidas por cada arrendador y se mostrarán en la página de detalle de la propiedad. Generalmente:
            </p>
            <ul>
              <li><strong>Cancelación con Reembolso Completo:</strong> Podrá aplicarse si la cancelación se realiza con una antelación específica (ej. 48 horas antes del check-in).</li>
              <li><strong>Cancelación con Reembolso Parcial:</strong> Podrá aplicarse si la cancelación se realiza fuera del período de reembolso completo.</li>
              <li><strong>No-Show y Cancelaciones Tardías:</strong> Si el arrendatario no se presenta (no-show) o cancela fuera de los plazos permitidos, no se otorgará ningún reembolso.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6">6. Uso Aceptable y Normas de la Propiedad</h2>
            <p>
              El arrendatario y sus acompañantes se comprometen a respetar las normas específicas de cada propiedad, que pueden incluir, entre otras: prohibición de fumar, no realizar fiestas o eventos no autorizados, y mantener niveles de ruido razonables. El incumplimiento de estas normas puede resultar en la terminación del contrato de arriendo sin reembolso.
            </p>

            <h2 className="text-2xl font-semibold mt-6">7. Política de Privacidad y Protección de Datos</h2>
            <p>
              Al utilizar nuestra plataforma, usted acepta la recopilación y uso de su información personal (nombre, correo electrónico, detalles de pago, etc.) conforme a nuestra Política de Privacidad. Estos datos se utilizan exclusivamente para gestionar su reserva, procesar pagos y comunicarnos con usted. Cumplimos con la Ley N° 19.628 sobre Protección de la Vida Privada en Chile.
            </p>

            <h2 className="text-2xl font-semibold mt-6">8. Limitación de Responsabilidad</h2>
            <p>
              ArriendosPuertoVaras.cl actúa únicamente como un intermediario que facilita la conexión entre arrendadores y arrendatarios. No somos propietarios, gestores ni operadores de ninguna de las propiedades o servicios listados. Por lo tanto, no nos hacemos responsables de la calidad, seguridad o legalidad de los mismos, ni de la veracidad de los listados. Cualquier disputa o problema debe resolverse directamente entre el arrendatario y el arrendador.
            </p>

            <h2 className="text-2xl font-semibold mt-6">9. Modificaciones de los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Se notificará a los usuarios de cualquier cambio material por correo electrónico o mediante un aviso en la plataforma. El uso continuado del servicio después de dichos cambios constituirá su aceptación de los nuevos términos.
            </p>

            <h2 className="text-2xl font-semibold mt-6">10. Jurisdicción y Resolución de Conflictos</h2>
            <p>
              Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa, controversia o reclamación que surja de o en relación con estos términos, será sometida a la jurisdicción de los tribunales ordinarios de justicia de la ciudad de Puerto Montt.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
