import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import LazyImage from '@/components/ui/LazyImage';
import { MapPin, Users, Star, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import { ui } from '@/components/utils/flags';

/**
 * Skeleton card component for loading state
 * @returns {JSX.Element}
 */
const SkeletonCard = () => (
  <div className="neuro-property-card animate-pulse" role="presentation" aria-hidden="true">
    <div className="neuro-property-image bg-slate-300"></div>
    <div className="neuro-property-content p-4">
      <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-300 rounded w-1/2 mb-4"></div>
      <div className="h-3 bg-slate-300 rounded w-full mb-1"></div>
      <div className="h-3 bg-slate-300 rounded w-full mb-4"></div>
      <div className="flex justify-between items-center mt-auto">
        <div className="h-6 bg-slate-300 rounded w-1/3"></div>
        <div className="h-4 bg-slate-300 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

/**
 * Error state component
 * @param {Object} props
 * @param {() => void} [props.onRetry] - Retry function
 * @returns {JSX.Element}
 */
const ErrorState = ({ onRetry }) => (
  <div className="text-center py-12" role="alert">
    <p className="text-slate-600 mb-4">
      No pudimos cargar las propiedades destacadas en este momento.
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        Intentar nuevamente
      </Button>
    )}
  </div>
);

/**
 * FeaturedProperties component
 * @param {Object} props
 * @param {import('../types/ui').FeaturedProperty[]} props.properties - Featured properties to display
 * @param {boolean} [props.loading=false] - Loading state
 * @param {Error|null} [props.error=null] - Error state
 * @param {() => void} [props.onRetry] - Retry function for error state
 * @returns {JSX.Element}
 */
export default function FeaturedProperties({ 
  properties = [], 
  loading = false, 
  error = null, 
  onRetry 
}) {
  // Generate descriptive alt text for property images
  const generateImageAlt = (property) => {
    return `${property.title} en ${property.location} - ${property.category} para ${property.max_guests} huéspedes desde $${property.price_per_night?.toLocaleString()} por noche`;
  };

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
          padding: 4rem 2rem;
        }

        .neuro-property-card {
          background: var(--neu-bg) !important;
          box-shadow: inset 6px 6px 12px var(--neu-dark), inset -6px -6px 12px var(--neu-light);
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          touch-action: manipulation;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .neuro-property-card:hover {
          background: var(--neu-bg) !important;
          transform: translateY(0);
          box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
          text-decoration: none;
        }

        .neuro-property-card:focus-visible {
          outline: 2px solid var(--neu-primary);
          outline-offset: 2px;
        }

        .neuro-property-image {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
        }

        .neuro-property-content {
          padding: 1.5rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .neuro-property-title {
          color: var(--neu-text) !important;
          font-weight: 600;
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .neuro-property-location {
          color: var(--neu-text-light) !important;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .neuro-property-location .lucide {
          color: var(--neu-text-light) !important;
          margin-right: 0.25rem;
          width: 1rem;
          height: 1rem;
        }

        .neuro-property-description {
          color: var(--neu-text-light) !important;
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .neuro-property-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .neuro-property-price {
          color: var(--neu-text) !important;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .neuro-property-price-unit {
          color: var(--neu-text-light) !important;
          font-weight: 400;
          font-size: 0.875rem;
        }

        .neuro-property-guests {
          color: var(--neu-text-light) !important;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
        }

        .neuro-property-guests .lucide {
          color: var(--neu-text-light) !important;
          margin-right: 0.25rem;
          width: 1rem;
          height: 1rem;
        }

        .neuro-badge {
          background: rgba(224, 224, 224, 0.9) !important;
          color: var(--neu-text) !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 8px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          backdrop-filter: blur(4px);
        }

        .neuro-badge-rating {
          background: rgba(224, 224, 224, 0.9) !important;
          color: var(--neu-text) !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 8px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          backdrop-filter: blur(4px);
        }

        .neuro-badge-rating .lucide {
          color: var(--neu-primary) !important;
          width: 0.75rem;
          height: 0.75rem;
        }

        .neuro-view-all-button {
          background: var(--neu-bg) !important;
          color: var(--neu-text) !important;
          border: none !important;
          border-radius: 12px !important;
          box-shadow: 5px 5px 10px var(--neu-dark), -5px -5px 10px var(--neu-light) !important;
          transition: all 0.2s ease-in-out !important;
        }

        .neuro-view-all-button:hover {
          transform: translateY(-1px);
          box-shadow: 7px 7px 14px var(--neu-dark), -7px -7px 14px var(--neu-light) !important;
          color: var(--neu-primary) !important;
        }

        .neuro-view-all-button:active {
          transform: translateY(0);
          box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light) !important;
          color: var(--neu-primary) !important;
        }

        .neuro-view-all-button:focus-visible {
          outline: 2px solid var(--neu-primary);
          outline-offset: 2px;
        }

        .neuro-view-all-button .lucide {
          color: inherit !important;
          transition: color 0.2s ease;
        }

        @media (max-width: 768px) {
          .neuro-property-card {
            border-radius: 16px;
            box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
          }
          
          .neuro-property-card:hover {
            box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
          }
          
          .neuro-property-image {
            height: 200px;
          }
        }
      `}</style>
      
      <section className="neuro-section" aria-labelledby="featured-properties-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            id="featured-properties-heading"
            title="Propiedades destacadas"
            description="Las mejores opciones seleccionadas especialmente para ti."
          />

          {error && <ErrorState onRetry={onRetry} />}
          
          {!error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
              {loading ? (
                Array.from({ length: ui.SKELETON_COUNT / 2 }).map((_, index) => (
                  <SkeletonCard key={`skeleton-${index}`} />
                ))
              ) : (
                properties.map((prop, index) => (
                  <Link 
                    key={prop.id} 
                    to={createPageUrl("PropertyDetail") + `?id=${prop.id}`} 
                    className="neuro-property-card"
                    role="listitem"
                    aria-label={`Ver detalles de ${prop.title} en ${prop.location}`}
                  >
                    <div className="neuro-property-image">
                      <LazyImage 
                        src={prop.images?.[0] || "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop"} 
                        alt={generateImageAlt(prop)}
                        loading={index < 3 ? "eager" : "lazy"}
                        className="w-full h-full object-cover" 
                        width={400}
                        height={240}
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <div className="neuro-badge">
                          {prop.category}
                        </div>
                        {prop.rating > 0 && (
                          <div className="neuro-badge-rating" aria-label={`Calificación ${prop.rating} de 5 estrellas basada en ${prop.total_reviews} reseñas`}>
                            <Star className="fill-current" aria-hidden="true" />
                            <span>{prop.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="neuro-property-content">
                      <h3 className="neuro-property-title">{prop.title}</h3>
                      <div className="neuro-property-location">
                        <MapPin aria-hidden="true" />
                        <span>{prop.location}</span>
                      </div>
                      {prop.description && (
                        <p className="neuro-property-description">{prop.description}</p>
                      )}
                      <div className="neuro-property-footer">
                        <div>
                          <span className="neuro-property-price" aria-label={`Precio ${prop.price_per_night?.toLocaleString()} pesos chilenos por noche`}>
                            ${prop.price_per_night?.toLocaleString()}
                          </span>
                          <span className="neuro-property-price-unit">/noche</span>
                        </div>
                        <div className="neuro-property-guests" aria-label={`Capacidad máxima ${prop.max_guests} huéspedes`}>
                          <Users aria-hidden="true" />
                          <span>{prop.max_guests}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <div className="text-center mt-16">
              <Link to={createPageUrl("Properties")} aria-label="Ver todas las propiedades disponibles">
                <Button size="lg" className="neuro-view-all-button">
                  Ver todas las propiedades <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}