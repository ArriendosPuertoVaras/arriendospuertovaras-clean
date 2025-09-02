import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function Newsletter() {
  return (
    <>
      <style>{`
        /* Variables neumórficas (asumiendo que están definidas globalmente o aquí) */
        :root {
          --neu-bg: #e0e0e0;
          --neu-light: #ffffff;
          --neu-dark: #bebebe;
          --neu-primary: #fcc332;
          --neu-text: #333333;
          --neu-text-light: #666666;
        }
        
        .neuro-newsletter-section {
          background-color: var(--neu-bg, #e0e0e0);
          padding: 4rem 2rem;
        }

        .neuro-newsletter-card {
          background: var(--neu-bg, #e0e0e0);
          box-shadow: 10px 10px 20px var(--neu-dark, #bebebe), -10px -10px 20px var(--neu-light, #ffffff);
          border-radius: 24px;
          padding: 2.5rem;
          text-align: center;
        }

        .neuro-newsletter-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--neu-bg, #e0e0e0);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 1.5rem;
          box-shadow: 6px 6px 12px var(--neu-dark, #bebebe), -6px -6px 12px var(--neu-light, #ffffff);
        }
        
        .neuro-newsletter-icon-circle .lucide {
            color: var(--neu-primary, #fcc332);
        }

        .neuro-newsletter-button {
          border-radius: 12px !important;
          font-weight: 600;
          transition: all 0.2s ease-in-out;
          border: none !important;
          background-color: var(--neu-bg) !important;
          color: var(--neu-text, #333333) !important;
          box-shadow: 5px 5px 10px var(--neu-dark, #bebebe), -5px -5px 10px var(--neu-light, #ffffff);
          padding: 0.75rem 1.5rem !important;
          height: auto !important;
          display: block !important;
          margin: 0 auto !important;
          width: auto !important;
          text-align: center !important;
        }
        
        .neuro-newsletter-button:hover {
            background-color: var(--neu-bg) !important;
            transform: translateY(-1px);
            box-shadow: 7px 7px 14px var(--neu-dark, #bebebe), -7px -7px 14px var(--neu-light, #ffffff);
            color: var(--neu-primary) !important;
        }

        .neuro-newsletter-button:active {
          background-color: var(--neu-bg) !important;
          transform: translateY(0);
          box-shadow: inset 4px 4px 8px var(--neu-dark, #bebebe), inset -4px -4px 8px var(--neu-light, #ffffff);
          color: var(--neu-primary) !important;
        }
      `}</style>
      <section className="neuro-newsletter-section">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="neuro-newsletter-card">
              <div className="neuro-newsletter-icon-circle">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{color: 'var(--neu-text, #333333)'}}>
                Mantente informado sin spam
              </h3>
              <p className="mb-6" style={{color: 'var(--neu-text-light, #666666)'}}>
                Recibe las mejores ofertas, propiedades nuevas y guías exclusivas de Puerto Varas.
              </p>
              <div className="w-full flex justify-center">
                <Link to={createPageUrl("Newsletter")}>
                  <Button className="neuro-newsletter-button" size="lg">
                    Suscríbete para recibir ofertas
                  </Button>
                </Link>
              </div>
          </div>
        </div>
      </section>
    </>
  );
}