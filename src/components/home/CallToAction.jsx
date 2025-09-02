
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import DifferentiatorsModalContent from './DifferentiatorsModal';

export default function CallToAction() {
  return (
    <>
      <style>{`
        .neuro-cta-section-wrapper {
          padding: 2rem 0;
          background-color: #e0e0e0;
        }

        .neuro-cta-section {
          background-color: #fcc332;
          color: black;
          margin: 1rem 1.5rem;
          border-radius: 24px;
          box-shadow: 10px 10px 20px #d9a82c, -10px -10px 20px #ffffe6;
          padding: 5rem 1rem;
        }

        .neuro-cta-button {
          border-radius: 12px !important;
          font-weight: 600;
          transition: all 0.2s ease-in-out;
          border: none !important;
          background-color: #fcc332 !important;
          /* Estado normal: hundido con texto negro */
          box-shadow: inset 4px 4px 8px #d9a82c, inset -4px -4px 8px #ffffe6;
          color: #1a1a1a !important;
          min-width: 180px;
        }

        .neuro-cta-button:hover {
          background-color: #fcc332 !important;
          /* Sombra inset más sutil al pasar el ratón */
          box-shadow: inset 2px 2px 4px #d9a82c, inset -2px -2px 4px #ffffe6;
          color: #1a1a1a !important;
        }

        .neuro-cta-button:active {
          background-color: #fcc332 !important;
          /* Estado al hacer clic: levantado con texto azul */
          color: #2563eb !important;
          transform: translateY(-2px);
          box-shadow: 5px 5px 10px #d9a82c, -5px -5px 10px #ffffe6;
        }

        .neuro-cta-link {
            color: black;
            font-weight: 600;
            text-decoration: underline;
            transition: color 0.2s ease;
            border-radius: 12px !important;
            transition: all 0.2s ease-in-out;
            border: none !important;
            background-color: transparent !important;
            padding: 0.75rem 1.5rem !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
            width: auto !important;
            text-align: center !important;
        }
        .neuro-cta-link:hover {
            color: #333;
        }
      `}</style>
      <div className="neuro-cta-section-wrapper">
        <section className="neuro-cta-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Tienes una propiedad o ofreces un servicio?</h2>
            <p className="text-lg text-yellow-900 max-w-3xl mx-auto mb-8">
              Únete a nuestra comunidad de anfitriones y proveedores. Comienza a generar ingresos compartiendo tu espacio o tus habilidades. ¡Publica gratis!
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link to={createPageUrl("AddProperty")}>
                <Button size="lg" className="neuro-cta-button w-full sm:w-auto">Publicar Propiedad</Button>
              </Link>
              <Link to={createPageUrl("AddService")}>
                <Button size="lg" className="neuro-cta-button w-full sm:w-auto">Ofrecer Servicio</Button>
              </Link>
            </div>
            <div className="mt-8 w-full flex justify-center">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            size="lg"
                            variant="link"
                            className="neuro-cta-link text-base"
                        >
                            Descubre por qué somos diferentes
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl p-8">
                        <DifferentiatorsModalContent />
                    </DialogContent>
                </Dialog>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
