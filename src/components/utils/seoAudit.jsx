/**
 * Auditoría y corrección automática del módulo SEO
 * Este archivo identifica y corrige problemas comunes de SEO
 */

import { SEOSettings } from '@/api/entities';
import { SEOContent } from '@/api/entities';
import { ErrorLog } from '@/api/entities';

/**
 * Audita y corrige problemas de configuración SEO
 */
export async function auditAndFixSEO() {
  const issues = [];
  const fixes = [];

  try {
    // 1. Verificar configuración básica de SEOSettings
    const settings = await SEOSettings.list();
    
    if (settings.length === 0) {
      // PROBLEMA: No hay configuración SEO básica
      const defaultSettings = {
        ga_measurement_id: "G-9ZGG23T6WF",
        search_console_verification: "",
        ai_seo_enabled: true,
        target_language: "es-CL",
        max_publications_per_week: 3,
        target_keywords: [
          "arriendos puerto varas",
          "cabañas puerto varas",
          "alojamiento puerto varas",
          "servicios puerto varas",
          "turismo puerto varas"
        ],
        schema_markup_enabled: true,
        sitemap_auto_update: true
      };
      
      await SEOSettings.create(defaultSettings);
      issues.push("Configuración SEO faltante");
      fixes.push("Creada configuración SEO por defecto con keywords regionales");
    }

    // 2. Verificar páginas críticas sin SEO
    const criticalPages = [
      { url: '/', name: 'Home' },
      { url: '/Properties', name: 'Properties' },
      { url: '/ServicesHub', name: 'Services' },
      { url: '/Blog', name: 'Blog' },
      { url: '/Contact', name: 'Contact' }
    ];

    const existingSEOContent = await SEOContent.list();
    const existingUrls = existingSEOContent.map(content => content.page_url);

    for (const page of criticalPages) {
      if (!existingUrls.includes(page.url)) {
        // PROBLEMA: Página crítica sin contenido SEO
        const seoData = generateDefaultSEOForPage(page.url, page.name);
        await SEOContent.create(seoData);
        issues.push(`Página ${page.name} sin SEO`);
        fixes.push(`Generado SEO automático para ${page.name}`);
      }
    }

    // 3. Verificar contenido SEO incompleto
    const incompleteSEO = existingSEOContent.filter(content => 
      !content.title || !content.meta_description || content.title.length > 60 || content.meta_description.length > 155
    );

    for (const content of incompleteSEO) {
      const updates = {};
      
      if (!content.title || content.title.length > 60) {
        updates.title = generateTitle(content.page_url).substring(0, 60);
        issues.push(`Título faltante/muy largo en ${content.page_url}`);
        fixes.push(`Título optimizado para ${content.page_url}`);
      }
      
      if (!content.meta_description || content.meta_description.length > 155) {
        updates.meta_description = generateMetaDescription(content.page_url).substring(0, 155);
        issues.push(`Meta description faltante/muy larga en ${content.page_url}`);
        fixes.push(`Meta description optimizada para ${content.page_url}`);
      }

      if (Object.keys(updates).length > 0) {
        await SEOContent.update(content.id, updates);
      }
    }

    // 4. Log de la auditoría
    await ErrorLog.create({
      error_message: "SEO Audit Completed",
      stack_trace: JSON.stringify({ issues, fixes }),
      component_info: "SEO Module",
      url: "/seo-audit",
      user_agent: "System",
      user_id: "system",
      status: "resolved"
    });

    return { issues, fixes };

  } catch (error) {
    await ErrorLog.create({
      error_message: `SEO Audit Failed: ${error.message}`,
      stack_trace: error.stack,
      component_info: "SEO Audit",
      url: "/seo-audit",
      user_agent: "System",
      user_id: "system",
      status: "new"
    });
    
    throw error;
  }
}

/**
 * Genera contenido SEO por defecto para una página
 */
function generateDefaultSEOForPage(url, pageName) {
  const baseData = {
    page_url: url,
    page_type: url === '/' ? 'home' : 'static',
    language: 'es-CL',
    status: 'active'
  };

  switch (url) {
    case '/':
      return {
        ...baseData,
        title: 'Arriendos en Puerto Varas | Casas, Cabañas y Servicios',
        meta_description: 'Encuentra arriendos turísticos, servicios profesionales y experiencias únicas en Puerto Varas. La plataforma local más completa.',
        h1: 'Arriendos y Servicios en Puerto Varas',
        target_keywords: ['arriendos puerto varas', 'cabañas puerto varas', 'servicios puerto varas']
      };
      
    case '/Properties':
      return {
        ...baseData,
        title: 'Propiedades en Arriendo - Puerto Varas | Cabañas y Casas',
        meta_description: 'Explora cabañas, casas y departamentos en arriendo en Puerto Varas. Reserva fácil y segura en la plataforma local.',
        h1: 'Propiedades en Arriendo en Puerto Varas',
        target_keywords: ['cabañas puerto varas', 'casas arriendo puerto varas', 'alojamiento puerto varas']
      };
      
    case '/ServicesHub':
      return {
        ...baseData,
        title: 'Servicios Profesionales Puerto Varas | Experiencias Locales',
        meta_description: 'Servicios para tu hogar y experiencias turísticas en Puerto Varas. Profesionales verificados y experiencias únicas.',
        h1: 'Servicios y Experiencias en Puerto Varas',
        target_keywords: ['servicios puerto varas', 'turismo puerto varas', 'experiencias puerto varas']
      };
      
    default:
      return {
        ...baseData,
        title: `${pageName} - Arriendos Puerto Varas`,
        meta_description: `${pageName} en la plataforma local de arriendos y servicios de Puerto Varas.`,
        h1: pageName,
        target_keywords: ['puerto varas', pageName.toLowerCase()]
      };
  }
}

/**
 * Genera título optimizado
 */
function generateTitle(url) {
  const titles = {
    '/': 'Arriendos Puerto Varas | Casas, Cabañas y Servicios',
    '/Properties': 'Propiedades en Arriendo Puerto Varas | Cabañas',
    '/ServicesHub': 'Servicios Puerto Varas | Experiencias Locales',
    '/Blog': 'Blog Puerto Varas | Turismo y Servicios',
    '/Contact': 'Contacto | Arriendos Puerto Varas'
  };
  
  return titles[url] || 'Puerto Varas | Arriendos y Servicios';
}

/**
 * Genera meta description optimizada
 */
function generateMetaDescription(url) {
  const descriptions = {
    '/': 'Arriendos turísticos, servicios profesionales y experiencias en Puerto Varas. La plataforma local más completa de la región.',
    '/Properties': 'Cabañas, casas y departamentos en arriendo en Puerto Varas. Reservas fáciles y seguras con propietarios locales.',
    '/ServicesHub': 'Servicios para el hogar y experiencias turísticas en Puerto Varas. Profesionales verificados y actividades únicas.',
    '/Blog': 'Guías, tips y noticias sobre turismo, arriendos y servicios en Puerto Varas y la región de Los Lagos.',
    '/Contact': 'Contáctanos para consultas sobre arriendos, servicios o para publicar en nuestra plataforma de Puerto Varas.'
  };
  
  return descriptions[url] || 'Información y servicios en Puerto Varas, la plataforma local más completa.';
}