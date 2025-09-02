import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-slate-800">Política de Privacidad</CardTitle>
            <p className="text-slate-500">Última actualización: 9 de Agosto de 2024</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p>
              En ArriendosPuertoVaras.cl, nos comprometemos a proteger tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.
            </p>

            <h2 className="text-2xl font-semibold mt-6">1. Información que Recopilamos</h2>
            <p>
              Recopilamos información que nos proporcionas directamente, como tu nombre, correo electrónico, número de teléfono y detalles de pago al realizar una reserva. También recopilamos información automáticamente, como tu dirección IP y datos de navegación.
            </p>

            <h2 className="text-2xl font-semibold mt-6">2. Cómo Usamos tu Información</h2>
            <p>
              Utilizamos tu información para:
            </p>
            <ul>
              <li>Procesar tus reservas y pagos.</li>
              <li>Comunicarnos contigo sobre tu cuenta o tus reservas.</li>
              <li>Mejorar y personalizar nuestros servicios.</li>
              <li>Cumplir con nuestras obligaciones legales.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6">3. Cómo Compartimos tu Información</h2>
            <p>
              Compartimos información con los anfitriones para facilitar las reservas. También podemos compartir información con proveedores de servicios de confianza (como procesadores de pago) y con autoridades legales si así se requiere.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6">4. Seguridad de tus Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra el acceso no autorizado, la alteración, la divulgación o la destrucción.
            </p>

            <h2 className="text-2xl font-semibold mt-6">5. Tus Derechos</h2>
            <p>
              Tienes derecho a acceder, corregir o eliminar tu información personal. También puedes oponerte al procesamiento de tus datos. Para ejercer estos derechos, contáctanos a través de nuestro centro de ayuda.
            </p>

            <h2 className="text-2xl font-semibold mt-6">6. Política de Cookies</h2>
            <p>
              Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Puedes gestionar tus preferencias de cookies a través de la configuración de tu navegador.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6">7. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cualquier cambio publicando la nueva política en esta página.
            </p>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}