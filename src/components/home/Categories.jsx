
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LazyImage from '@/components/ui/LazyImage';
import { Home, Building, Car, Sparkles } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

const categoryData = [
  { 
    name: "Cabañas", 
    value: "cabaña", 
    icon: Home, 
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/942d158d3_airbnb-24_optimized.jpg", 
    description: "Acogedoras cabañas con vistas al lago.",
    targetPage: "Properties"
  },
  { 
    name: "Departamentos", 
    value: "departamento", 
    icon: Building, 
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&q=75", 
    description: "Modernos dptos. en el corazón de la ciudad.",
    targetPage: "Properties"
  },
  { 
    name: "Vehículos", 
    value: "transporte", 
    icon: Car, 
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0fdaeb97c_pexels-ton-souza-4596515_optimized.jpg", 
    description: "Arrienda autos para explorar la región.",
    targetPage: "Services",
    serviceType: "servicio"
  },
  { 
    name: "Experiencias", 
    value: "experiencia", 
    icon: Sparkles, 
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688f1481b_rio_petrohue_optimized.jpg", 
    description: "Vive aventuras únicas en la naturaleza.",
    targetPage: "Services",
    serviceType: "experiencia"
  }
];

export default function Categories() {
  const buildCategoryLink = (cat) => {
    if (cat.targetPage === "Properties") {
      return createPageUrl("Properties") + `?category=${cat.value}`;
    } else if (cat.targetPage === "Services") {
      if (cat.serviceType === "experiencia") {
        return createPageUrl("Services") + `?type=experiencia`;
      } else {
        return createPageUrl("Services") + `?type=servicio&category=${cat.value}`;
      }
    }
    return createPageUrl("Properties");
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

        .neuro-category-card {
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

        .neuro-category-card:hover {
          background: var(--neu-bg) !important;
          transform: translateY(0);
          box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
          text-decoration: none;
        }

        .neuro-category-card:active {
          background: var(--neu-bg) !important;
          transform: translateY(0);
          box-shadow: inset 8px 8px 16px var(--neu-dark), inset -8px -8px 16px var(--neu-light);
        }

        /* Mantener colores originales - NO amarillo */
        .neuro-category-card .lucide {
          color: var(--neu-text-light) !important;
        }

        .neuro-category-card h3 {
          color: var(--neu-text) !important;
        }

        .neuro-category-card p {
          color: var(--neu-text-light) !important;
        }

        .neuro-category-image {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .neuro-category-content {
          padding: 1.5rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        @media (max-width: 768px) {
          .neuro-category-card {
            border-radius: 16px;
            box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
          }
          
          .neuro-category-card:hover {
            box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
          }
          
          .neuro-category-card:active {
            box-shadow: inset 6px 6px 12px var(--neu-dark), inset -6px -6px 12px var(--neu-light);
          }
          
          .neuro-category-image {
            height: 160px;
          }
        }
      `}</style>
      
      <section className="neuro-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader 
            title="Explora por categorías"
            description="Desde acogedoras cabañas hasta emocionantes aventuras y servicios útiles."
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryData.map((cat) => (
              <Link key={cat.name} to={buildCategoryLink(cat)} className="neuro-category-card">
                <div className="neuro-category-image">
                  <LazyImage 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="neuro-category-content">
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">
                      {cat.name}
                    </h3>
                  </div>
                  <p className="text-sm">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
