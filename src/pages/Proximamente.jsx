import React, { useEffect } from 'react';
import CallToAction from '@/components/home/CallToAction';
import Newsletter from '@/components/home/Newsletter';
import { setDefaultMeta } from '@/components/utils/seo';

const AMARILLO = '#FCC332';

const USERS_FEATURES = [
  'Búsqueda simple por categorías',
  'Reservas seguras con Webpay',
  'Favoritos y reseñas',
  'Soporte local',
];

const OPERATORS_FEATURES = [
  'Publicación gratis e ilimitada',
  'Calendario y precios básicos',
  'Propiedades destacadas (Home + categoría)',
  'Programa de referidos con créditos',
];

const BUILDING_ITEMS = [
  'Publicaciones gratis e ilimitadas',
  'Destacados mensuales/únicos',
  'Programa de referidos',
  'Pagos con Webpay + recibo automático',
  'Servicios y experiencias locales',
  'Seguridad y privacidad primero',
];

const STEPS = [
  { n: 1, t: 'Publica', d: 'Crea tu propiedad o servicio en minutos.' },
  { n: 2, t: 'Destaca', d: 'Gana visibilidad en Home y categorías.' },
  { n: 3, t: 'Recibe reservas', d: 'Cobra con Webpay y recibe tu recibo.' },
];

const PLANS = [
  {
    name: 'Gratis',
    price: '$0',
    bullets: [
      'Publicaciones ilimitadas',
      'Visibilidad estándar',
    ],
  },
  {
    name: 'Destacado Simple',
    price: '$10.000 + IVA / mes',
    bullets: [
      '1 publicación destacada',
      'Home + categoría',
    ],
  },
  {
    name: 'Premium',
    price: '$24.990 + IVA / mes',
    bullets: [
      '3 destacadas',
      '1 post en redes sociales',
    ],
  },
  {
    name: 'Campaña Completa',
    price: '$79.990 + IVA',
    bullets: [
      '10 destacadas',
      'Banner publicitario',
      'Newsletter',
    ],
  },
];

export default function ComingSoonPage() {
  useEffect(() => {
    setDefaultMeta('proximamente', {
      title: 'Próximamente en Puerto Varas — Arriendos PV',
      description: 'Publica gratis, destaca y cobra con Webpay. Muy pronto en Puerto Varas.',
    });
  }, []);

  return (
    <div className="bg-manto min-h-screen">
      {/* HERO */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        style={{ background:
          'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.05) 100%)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight"
              style={{ color: AMARILLO }}>
            Próximamente en Puerto Varas
          </h1>
          <p className="mt-4 text-base sm:text-lg opacity-80 text-slate-700">
            La plataforma local para publicar gratis, destacar y reservar con Webpay.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <a href="/MiCuenta"
               className="px-5 py-3 rounded-xl font-medium shadow
                          hover:opacity-90 transition text-black"
               style={{ background: AMARILLO }}>
              Publica gratis
            </a>
            <a href="#newsletter"
               className="px-5 py-3 rounded-xl font-medium border shadow
                          hover:bg-black/5 transition bg-white text-slate-700">
              Avísame al lanzar
            </a>
          </div>
        </div>
      </section>

      {/* QUÉ ESTAMOS CONSTRUYENDO */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-slate-900">
            ¿Qué estamos construyendo?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUILDING_ITEMS.map((it) => (
              <div key={it}
                   className="neuro-card-outset rounded-2xl p-4">
                <div className="font-medium text-slate-800">{it}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA USUARIOS / OPERARIOS */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          <div className="neuro-card-outset rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">Para usuarios</h3>
            <ul className="space-y-2">
              {USERS_FEATURES.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full" style={{ background: AMARILLO }} />
                  <span className="text-slate-700">{x}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="neuro-card-outset rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">Para operarios</h3>
            <ul className="space-y-2">
              {OPERATORS_FEATURES.map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full" style={{ background: AMARILLO }} />
                  <span className="text-slate-700">{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-slate-900">¿Cómo funciona?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map(s => (
              <div key={s.n}
                   className="neuro-card-outset rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold" style={{ color: AMARILLO }}>{s.n}</div>
                <div className="mt-2 font-semibold text-slate-900">{s.t}</div>
                <div className="mt-1 opacity-80 text-slate-700">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-slate-900">Planes y destacados</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(p => (
              <div key={p.name}
                   className="neuro-card-outset rounded-2xl p-6">
                <div className="font-semibold text-slate-900">{p.name}</div>
                <div className="text-sm opacity-80 mt-1 text-slate-600">{p.price}</div>
                <ul className="mt-4 space-y-2">
                  {p.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1 w-2 h-2 rounded-full" style={{ background: AMARILLO }} />
                      <span className="text-slate-700">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reuso de componentes del Home */}
      <CallToAction />
      <div id="newsletter">
        <Newsletter />
      </div>
    </div>
  );
}