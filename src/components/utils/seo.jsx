// SEO utilities for better search optimization
export const generateStructuredData = (type, data) => {
  const baseStructuredData = {
    "@context": "https://schema.org",
  };

  switch (type) {
    case 'localbusiness':
  return {
    ...baseStructuredData,
    "@type": "LocalBusiness",
    "name": "Arriendos Puerto Varas",
    "description": "Plataforma local para arriendos de propiedades, servicios y experiencias en Puerto Varas y alrededores",
    "url": "https://arriendospuertovaras.cl",
    "logo": "https://arriendospuertovaras.cl/arriendos-puerto-varas-logo.jpg",
    "image": "https://arriendospuertovaras.cl/hero.jpg",
    "telephone": "+56-9-0000-0000",
    "email": "hola@arriendospuertovaras.cl",
    "sameAs": [
      "https://www.instagram.com/arriendospuertovaras.cl"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Puerto Varas",
      "addressRegion": "Los Lagos",
      "addressCountry": "CL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -41.3181,
      "longitude": -72.9857
    },
    "areaServed": [
      "Puerto Varas",
      "Puerto Montt",
      "Frutillar",
      "Llanquihue",
      "Región de Los Lagos"
    ],
    "serviceType": [
      "Arriendo de propiedades",
      "Servicios profesionales",
      "Experiencias turísticas",
      "Gestión de alojamientos"
    ],
    "foundingDate": "2024"
  };


    case 'property':
      return {
        ...baseStructuredData,
        "@type": "LodgingBusiness",
        "name": data.title,
        "description": data.description,
        "image": data.images || [],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": data.address,
          "addressLocality": data.location,
          "addressCountry": "CL"
        },
        "geo": data.latitude && data.longitude ? {
          "@type": "GeoCoordinates",
          "latitude": data.latitude,
          "longitude": data.longitude
        } : undefined,
        "priceRange": `$${data.price_per_night}`,
        "aggregateRating": data.rating > 0 ? {
          "@type": "AggregateRating",
          "ratingValue": data.rating,
          "reviewCount": data.total_reviews
        } : undefined
      };

    case 'service':
      return {
        ...baseStructuredData,
        "@type": "Service",
        "name": data.title,
        "description": data.description,
        "provider": {
          "@type": "LocalBusiness",
          "name": "Arriendos Puerto Varas"
        },
        "serviceType": data.category_slug,
        "areaServed": data.coverage_areas || ["Puerto Varas"],
        "offers": {
          "@type": "Offer",
          "price": data.price_per_hour || data.price_per_day || data.price_per_service,
          "priceCurrency": "CLP",
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": data.price_per_hour || data.price_per_day || data.price_per_service,
            "priceCurrency": "CLP",
            "unitText": data.pricing_model === "por_hora" ? "per hour" :
                       data.pricing_model === "por_dia" ? "per day" : "fixed price"
          }
        },
        "aggregateRating": data.rating > 0 ? {
          "@type": "AggregateRating",
          "ratingValue": data.rating,
          "reviewCount": data.total_reviews
        } : undefined
      };

    case 'faqpage':
      return {
        ...baseStructuredData,
        "@type": "FAQPage",
        "mainEntity": data.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.detailed_answer || faq.short_answer
          }
        }))
      };

    case 'breadcrumbs':
      return {
        ...baseStructuredData,
        "@type": "BreadcrumbList",
        "itemListElement": data.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.label,
          "item": item.href ? `${window.location.origin}${item.href}` : undefined
        }))
      };

    case 'blog':
      return {
        ...baseStructuredData,
        "@type": "Article",
        "headline": data.title,
        "description": data.excerpt,
        "image": data.featured_image,
        "author": {
          "@type": "Organization",
          "name": "Arriendos Puerto Varas"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Arriendos Puerto Varas",
          "logo": {
            "@type": "ImageObject",
            "url": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6e1e7c832_ChatGPTImageAug5202504_16_09PM.png"
          }
        },
        "datePublished": data.created_date,
        "dateModified": data.updated_date || data.created_date,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": window.location.href
        }
      };

    default:
      return baseStructuredData;
  }
};

export const insertStructuredData = (structuredData) => {
  try {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Insert new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  } catch (error) {
    console.error('Error inserting structured data:', error);
  }
};

export const setPageMeta = (title, description, canonical, ogImage) => {
  try {
    // Set title
    if (title) {
      document.title = title;
    }

    // Set meta description
    if (description) {
      let metaDesc = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // Set canonical URL
    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical || window.location.href;

    // Set Open Graph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: window.location.href },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Arriendos Puerto Varas' }
    ];

    if (ogImage) {
      ogTags.push({ property: 'og:image', content: ogImage });
    }

    ogTags.forEach(tag => {
      if (tag.content) {
        let ogTag = document.querySelector(`meta[property='${tag.property}']`);
        if (!ogTag) {
          ogTag = document.createElement('meta');
          ogTag.setAttribute('property', tag.property);
          document.head.appendChild(ogTag);
        }
        ogTag.content = tag.content;
      }
    });

    // Set Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description }
    ];

    if (ogImage) {
      twitterTags.push({ name: 'twitter:image', content: ogImage });
    }

    twitterTags.forEach(tag => {
      if (tag.content) {
        let twitterTag = document.querySelector(`meta[name='${tag.name}']`);
        if (!twitterTag) {
          twitterTag = document.createElement('meta');
          twitterTag.name = tag.name;
          document.head.appendChild(twitterTag);
        }
        twitterTag.content = tag.content;
      }
    });

  } catch (error) {
    console.error('Error setting page meta:', error);
  }
};

// Default meta configurations for different pages
const DEFAULT_METAS = {
  home: {
    title: 'Arriendos en Puerto Varas | Casas, Cabañas y Departamentos',
    description: 'Encuentra arriendos turísticos y de larga estadía en Puerto Varas. Reserva casas, cabañas y departamentos de forma fácil y segura.',
    canonical: 'https://arriendospuertovaras.cl/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-home.jpg'
  },

  properties: {
    title: 'Explorar Propiedades en Puerto Varas | Arriendos de Cabañas y Casas',
    description: 'Busca y filtra entre decenas de propiedades verificadas en Puerto Varas. Encuentra la cabaña, casa o departamento perfecto para tu estadía.',
    canonical: 'https://arriendospuertovaras.cl/arriendos/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-properties.jpg'
  },

  'category-cabaña': {
    title: 'Cabañas en Puerto Varas – Arriendos por día y semana',
    description: 'Encuentra cabañas equipadas en Puerto Varas: orilla de lago, con tinaja y pet-friendly. Reserva rápida y segura por WhatsApp.',
    canonical: 'https://arriendospuertovaras.cl/arriendos/puerto-varas/cabanas/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-cabanas.jpg'
  },

  'category-departamento': {
    title: 'Arriendo de Departamentos en Puerto Varas – Turismo y residencia',
    description: 'Departamentos céntricos y frente al lago en Puerto Varas. Opciones por día y mes. Reserva con confianza.',
    canonical: 'https://arriendospuertovaras.cl/arriendos/puerto-varas/departamentos/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-departamentos.jpg'
  },

  'category-casa': {
    title: 'Arriendo de Casas en Puerto Varas – Temporada y larga estadía',
    description: 'Casas amobladas y sin amoblar en Puerto Varas para familias, trabajo remoto y vacaciones. Consulta disponibilidad.',
    canonical: 'https://arriendospuertovaras.cl/arriendos/puerto-varas/casas/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-casas.jpg'
  },

  contacto: {
    title: 'Contacto | ArriendosPuertoVaras.cl',
    description: '¿Dudas o reservas en Puerto Varas? Escríbenos por WhatsApp o completa el formulario. Respondemos rápido.',
    canonical: 'https://arriendospuertovaras.cl/contacto/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-contacto.jpg'
  },

  'quienes-somos': {
    title: 'Quiénes Somos | Arriendos Puerto Varas',
    description: 'Nuestra misión es conectar a viajeros y propietarios con arriendos confiables en Puerto Varas, con atención cercana y transparente.',
    canonical: 'https://arriendospuertovaras.cl/quienes-somos/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-quienes.jpg'
  },

  blog: {
    title: 'Blog - Arriendos Puerto Varas | Turismo y Servicios',
    description: 'Descubre los mejores destinos, tips de viaje, guías locales y consejos para disfrutar al máximo de Puerto Varas y la región de Los Lagos.',
    canonical: 'https://arriendospuertovaras.cl/blog/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-blog.jpg'
  },

  'help-center': {
    title: 'Centro de Ayuda | Arriendos Puerto Varas',
    description: 'Encuentra respuestas a tus preguntas sobre reservas, pagos, cancelaciones y cómo usar nuestra plataforma. Soporte para huéspedes y anfitriones.',
    canonical: 'https://arriendospuertovaras.cl/ayuda/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-help.jpg'
  },

  services: {
    title: 'Servicios en Puerto Varas | Profesionales Verificados',
    description: 'Encuentra servicios profesionales en Puerto Varas: limpieza, jardinería, mantención y más. Proveedores verificados y confiables.',
    canonical: 'https://arriendospuertovaras.cl/servicios/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-services.jpg'
  },

  proximamente: {
    title: 'Próximamente en Puerto Varas — Arriendos PV',
    description: 'Publica gratis, destaca y cobra con Webpay. Muy pronto en Puerto Varas.',
    canonical: 'https://arriendospuertovaras.cl/proximamente/',
    ogImage: 'https://arriendospuertovaras.cl/media/og-proximamente.jpg'
  },
};

// Helper function to set default meta with optional overrides
export const setDefaultMeta = (pageKey, overrides = {}) => {
  const defaultMeta = DEFAULT_METAS[pageKey];

  if (!defaultMeta) {
    console.warn(`No default meta found for pageKey: ${pageKey}`);
    return;
  }

  // Merge default meta with overrides
  const finalMeta = {
    ...defaultMeta,
    ...overrides
  };

  // Ensure title doesn't exceed ~60 characters
  if (finalMeta.title && finalMeta.title.length > 60) {
    finalMeta.title = finalMeta.title.substring(0, 57) + '...';
  }

  // Ensure description doesn't exceed ~155 characters
  if (finalMeta.description && finalMeta.description.length > 155) {
    finalMeta.description = finalMeta.description.substring(0, 152) + '...';
  }

  // Use current URL as fallback for canonical if not provided
  if (!finalMeta.canonical) {
    finalMeta.canonical = window.location.href;
  }

  setPageMeta(finalMeta.title, finalMeta.description, finalMeta.canonical, finalMeta.ogImage);
};