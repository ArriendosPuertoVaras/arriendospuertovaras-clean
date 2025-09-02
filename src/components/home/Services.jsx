
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import {
  Heart,
  Sparkles,
  Users,
  Home,
  Wrench,
  Car,
  TreePine,
  Utensils,
  ArrowRight
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

// Mix diversificado de servicios y experiencias
const mockCategories = [
  { id: '1', name: 'Cuidado a Domicilio', icon: Heart },
  { id: '2', name: 'Servicios de Mantención', icon: Wrench },
  { id: '3', name: 'Transporte y Traslados', icon: Car },
  { id: '4', name: 'Experiencias Gastronómicas', icon: Utensils },
  { id: '5', name: 'Limpieza y Aseo Profesional', icon: Sparkles },
  { id: '6', name: 'Jardinería y Paisajismo', icon: TreePine },
  { id: '7', name: 'Tours y Aventuras', icon: Users },
  { id: '8', name: 'Post-arriendo', icon: Home }
];

export default function Services({ categories = [] }) {
  // Estado para trackear qué círculos han sido presionados
  const [activeCircles, setActiveCircles] = useState(new Set());

  const handleCircleClick = (categoryId) => {
    setActiveCircles(prev => new Set([...prev, categoryId]));
  };

  // Usar categorías mockeadas si no hay datos reales
  const displayCategories = categories.length > 0 ? categories.slice(0, 8) : mockCategories;

  return (
    <div>
      <style>{`
        :root {
          --neu-bg: #e0e0e0;
          --neu-light: #ffffff;
          --neu-dark: #bebebe;
          --neu-primary: #fcc332;
          --neu-text: #333333;
          --neu-text-light: #666666;
        }

        .neuro-section {
          background-color: var(--neu-bg);
          padding: 3rem 2rem;
        }

        .neuro-card {
          background: var(--neu-bg) !important;
          box-shadow: 8px 8px 16px var(--neu-dark), -8px -8px 16px var(--neu-light);
          border-radius: 20px;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: all 0.3s ease;
          touch-action: manipulation;
          height: 100%;
        }

        .neuro-card:hover {
          transform: translateY(-1px);
          box-shadow: 10px 10px 20px rgba(190, 190, 190, 0.8), -10px -10px 20px rgba(255, 255, 255, 0.9);
        }

        /* Círculo del botón - estado normal (outset) */
        .neuro-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--neu-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
          box-shadow: 6px 6px 12px var(--neu-dark), -6px -6px 12px var(--neu-light);
          cursor: pointer;
          text-decoration: none;
        }

        /* Círculo en hover (solo si no está activo) */
        .neuro-icon-circle:hover:not(.active) {
          box-shadow: 8px 8px 16px rgba(190, 190, 190, 0.8), -8px -8px 16px rgba(255, 255, 255, 0.9);
        }

        /* Círculo en estado activo/presionado - hover */
        .neuro-icon-circle:hover:not(.active) .lucide {
          color: var(--neu-primary) !important;
        }

        /* Círculo en estado activo (persistente después del clic) */
        .neuro-icon-circle.active {
          box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
        }

        .neuro-icon-circle.active .lucide {
          color: var(--neu-primary) !important;
        }

        /* Círculo durante el clic (active) */
        .neuro-icon-circle:active {
          box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
        }

        .neuro-icon-circle:active .lucide {
          color: var(--neu-primary) !important;
        }

        /* Iconos y texto mantienen color normal - NO amarillo */
        .neuro-icon-circle .lucide {
          color: var(--neu-text-light);
          transition: color 0.3s ease;
        }

        .neuro-card h3 {
          font-weight: 600;
          color: var(--neu-text);
          margin: 0;
        }

        /* Styling for the new button */
        .neuro-view-all-button {
          background-color: var(--neu-primary);
          color: var(--neu-text);
          border-radius: 9999px; /* Fully rounded */
          box-shadow: 6px 6px 12px var(--neu-dark), -6px -6px 12px var(--neu-light);
          transition: all 0.3s ease;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .neuro-view-all-button:hover {
          transform: translateY(-1px);
          box-shadow: 8px 8px 16px rgba(190, 190, 190, 0.8), -8px -8px 16px rgba(255, 255, 255, 0.9);
          background-color: var(--neu-primary); /* Ensure it stays primary color on hover */
          opacity: 0.9;
        }

        .neuro-view-all-button:active {
          box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
          background-color: var(--neu-primary); /* Ensure it stays primary color on active */
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .neuro-card {
            border-radius: 16px;
            box-shadow: 6px 6px 12px var(--neu-dark), -6px -6px 12px var(--neu-light);
            padding: 1.5rem 1rem;
          }

          .neuro-icon-circle {
            width: 56px;
            height: 56px;
          }
        }
      `}</style>

      <section className="neuro-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Servicios y Experiencias Locales"
            description="Soluciones para tu propiedad y aventuras para disfrutar lo mejor de Puerto Varas."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayCategories.map((category) => {
              const IconComponent = category.icon || Sparkles;
              const serviceUrl = categories.length > 0
                ? createPageUrl(`ServiceCategoryDetail?id=${category.id}`)
                : createPageUrl('ServicesHub');

              const isActive = activeCircles.has(category.id);

              return (
                <div key={category.id} className="neuro-card">
                  <Link
                    to={serviceUrl}
                    className={`neuro-icon-circle ${isActive ? 'active' : ''}`}
                    onClick={() => handleCircleClick(category.id)}
                  >
                    <IconComponent
                      className="w-8 h-8"
                      strokeWidth={1.5}
                    />
                  </Link>
                  <h3 className="font-semibold text-base">
                    {category.name}
                  </h3>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <Link to={createPageUrl('ServicesHub')}>
              <Button size="lg" className="neuro-view-all-button">
                Ver todos los servicios y experiencias <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
