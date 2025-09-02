import React, { useState, useEffect, useCallback } from 'react';
import { Property } from '@/api/entities';
import { ServiceCategory } from '@/api/entities';
import { getCachedData, invalidateCache } from '@/components/utils/cache';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import CallToAction from '@/components/home/CallToAction';
import Newsletter from '@/components/home/Newsletter';
import Services from '@/components/home/Services';
import { uniqBy } from 'lodash';
import { setDefaultMeta, generateStructuredData, insertStructuredData } from '@/components/utils/seo';
import { safeEntityCall } from '@/components/utils/apiUtils';
import { User } from '@/api/entities';
import { flags, cache, ui } from '@/components/utils/flags';

/**
 * Mock data for featured properties
 * @type {import('../components/types/ui').FeaturedProperty[]}
 */
const MOCK_FEATURED_PROPERTIES = [
  {
    id: "featured-1",
    title: "Cabaña Vista al Lago",
    location: "Puerto Varas",
    category: "cabaña",
    price_per_night: 65000,
    images: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop"],
    rating: 4.8,
    total_reviews: 12,
    max_guests: 4,
    description: "Hermosa cabaña con vista panorámica al lago Llanquihue"
  },
  {
    id: "featured-2", 
    title: "Departamento Centro",
    location: "Puerto Varas",
    category: "departamento",
    price_per_night: 45000,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"],
    rating: 4.5,
    total_reviews: 8,
    max_guests: 2,
    description: "Moderno departamento en el corazón de Puerto Varas"
  },
  {
    id: "featured-3",
    title: "Casa Familiar", 
    location: "Frutillar",
    category: "casa",
    price_per_night: 85000,
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop"],
    rating: 4.7,
    total_reviews: 15,
    max_guests: 6,
    description: "Amplia casa familiar perfecta para grupos grandes"
  }
];

/**
 * HomePage component - Main landing page with featured properties and services
 * @returns {JSX.Element}
 */
export default function HomePage() {
  /** @type {[import('../components/types/ui').HomeServiceCategory[], React.Dispatch<React.SetStateAction<import('../components/types/ui').HomeServiceCategory[]>>]} */
  const [homeServices, setHomeServices] = useState([]);
  
  /** @type {[import('../components/types/ui').FeaturedProperty[], React.Dispatch<React.SetStateAction<import('../components/types/ui').FeaturedProperty[]>>]} */
  const [featuredProperties, setFeaturedProperties] = useState(MOCK_FEATURED_PROPERTIES);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch homepage data with error handling and caching
   * @param {AbortSignal} signal - Abort signal for cancelling requests
   */
  const fetchHomepageData = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar siempre mock data para evitar errores de red por ahora
      const useMockData = true; // Cambiado temporalmente a true
      
      if (useMockData) {
        console.log('Using mock data for homepage');
        
        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (signal.aborted) return;
        
        // Usar datos mock
        setFeaturedProperties(MOCK_FEATURED_PROPERTIES);
        setHomeServices([
          { id: '1', name: 'Cuidado a Domicilio', icon: 'Heart' },
          { id: '2', name: 'Servicios de Mantención', icon: 'Wrench' },
          { id: '3', name: 'Transporte y Traslados', icon: 'Car' },
          { id: '4', name: 'Experiencias Gastronómicas', icon: 'Utensils' },
          { id: '5', name: 'Limpieza y Aseo Profesional', icon: 'Sparkles' },
          { id: '6', name: 'Jardinería y Paisajismo', icon: 'TreePine' },
          { id: '7', name: 'Tours y Aventuras', icon: 'Users' },
          { id: '8', name: 'Post-arriendo', icon: 'Home' }
        ]);
        
        setLoading(false);
        return;
      }

      // Código original para datos reales (deshabilitado temporalmente)
      const servicesPromise = getCachedData(
        'home_services', 
        () => safeEntityCall(
          () => ServiceCategory.filter({ show_on_homepage: true }, 'display_order', ui.HOMEPAGE_SERVICES_COUNT), 
          [],
          { signal }
        ),
        cache.HOMEPAGE_CACHE_TTL_MS
      );

      const propertiesPromise = safeEntityCall(
        () => Property.filter({ featured: true, status: 'activa' }, '-rating', ui.FEATURED_PROPERTIES_COUNT),
        MOCK_FEATURED_PROPERTIES,
        { signal }
      );

      const [servicesData, propertiesData] = await Promise.all([servicesPromise, propertiesPromise]);
      
      // Check if request was aborted
      if (signal.aborted) return;
      
      // Update state with fetched data
      if (servicesData && Array.isArray(servicesData)) {
        setHomeServices(uniqBy(servicesData, 'id'));
      }
      
      setFeaturedProperties(propertiesData || MOCK_FEATURED_PROPERTIES);

    } catch (error) {
      console.error("Error fetching homepage data:", error);
      
      if (!signal.aborted) {
        setError(error);
        // Always fallback to mock data on error
        setFeaturedProperties(MOCK_FEATURED_PROPERTIES);
        setHomeServices([
          { id: '1', name: 'Cuidado a Domicilio', icon: 'Heart' },
          { id: '2', name: 'Servicios de Mantención', icon: 'Wrench' },
          { id: '3', name: 'Transporte y Traslados', icon: 'Car' },
          { id: '4', name: 'Experiencias Gastronómicas', icon: 'Utensils' }
        ]);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Set SEO metadata
    setDefaultMeta('home');
    
    // Insert structured data for local business
    try {
      const localBusinessData = generateStructuredData('localbusiness', {});
      insertStructuredData(localBusinessData);
    } catch (error) {
      console.warn('Error inserting structured data:', error);
    }

    // Fetch homepage data
    fetchHomepageData(signal);

    // Cleanup function
    return () => {
      controller.abort();
      invalidateCache('home_services');
    };
  }, [fetchHomepageData]);

  return (
    <div role="main" aria-label="Página principal de Arriendos Puerto Varas">
      <Hero />
      
      <section aria-label="Categorías de propiedades y servicios">
        <Categories />
      </section>
      
      <section aria-label="Propiedades destacadas">
        <FeaturedProperties 
          properties={featuredProperties} 
          loading={loading}
          error={error}
        />
      </section>
      
      <section aria-label="Servicios y experiencias locales">
        <Services 
          categories={homeServices}
          loading={loading}
        />
      </section>
      
      <section aria-label="Llamada a la acción">
        <CallToAction />
      </section>
      
      <section aria-label="Suscripción al boletín" id="newsletter">
        <Newsletter />
      </section>
    </div>
  );
}