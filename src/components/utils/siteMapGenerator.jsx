import React from 'react';
import { siteStructure, siteFunctions, conditionalStates } from './sitemapData';

// Generador de mapa visual del sitio
export const SiteMapGenerator = () => {
  const generateChecklist = () => {
    const checklist = [];
    
    Object.entries(siteStructure).forEach(([category, pages]) => {
      Object.entries(pages).forEach(([key, page]) => {
        checklist.push({
          category: category,
          page: page.name,
          url: page.url,
          component: page.component,
          description: page.description,
          features: page.features?.join(', ') || '',
          userStates: page.userStates?.join(', ') || '',
          authRequired: page.authRequired || false,
          adminOnly: page.adminOnly || false,
          status: 'Pendiente revisión',
          priority: page.authRequired ? 'Alta' : 'Media',
          observaciones: '',
          responsable: '',
          fechaRevision: ''
        });
      });
    });
    
    return checklist;
  };

  const generateSitemapXML = () => {
    const baseUrl = 'https://www.arriendospuertovaras.cl';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    Object.values(siteStructure).forEach(category => {
      Object.values(category).forEach(page => {
        if (!page.adminOnly && !page.authRequired) {
          const cleanUrl = page.url.replace(/\?.*/, '').replace(/:id/, '');
          xml += `
  <url>
    <loc>${baseUrl}${cleanUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page.url === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
        }
      });
    });

    xml += `
</urlset>`;
    return xml;
  };

  return {
    checklist: generateChecklist(),
    sitemapXML: generateSitemapXML(),
    structure: siteStructure,
    functions: siteFunctions,
    states: conditionalStates
  };
};

// Datos para la visualización del mapa
export const mapVisualizationData = {
  // Configuración de colores según ejemplo
  colors: {
    mainPages: '#1e3a8a',      // Azul oscuro
    detailPages: '#6b7280',    // Gris
    userPages: '#059669',      // Verde
    hostPages: '#dc2626',      // Rojo
    specialFeatures: '#f59e0b', // Naranja
    contentPages: '#7c3aed',   // Púrpura
    legalPages: '#374151',     // Gris oscuro
    adminFeatures: '#ef4444',  // Rojo claro
    aiIntegrations: '#06b6d4'  // Cyan
  },
  
  // Posicionamiento para el canvas
  layout: {
    canvasSize: { width: 1600, height: 1200 },
    startPosition: { x: 100, y: 100 },
    columnWidth: 200,
    rowHeight: 80,
    spacing: { x: 40, y: 30 }
  },
  
  // Conexiones entre páginas
  connections: [
    { from: 'home', to: 'properties', type: 'direct' },
    { from: 'home', to: 'services', type: 'direct' },
    { from: 'properties', to: 'propertyDetail', type: 'direct' },
    { from: 'services', to: 'serviceDetail', type: 'direct' },
    { from: 'propertyDetail', to: 'myBookings', type: 'conditional', condition: 'after_booking' },
    { from: 'home', to: 'becomeHost', type: 'cta' },
    { from: 'becomeHost', to: 'hostWizard', type: 'conditional', condition: 'signup' },
    { from: 'hostWizard', to: 'addProperty', type: 'direct' },
    { from: 'addProperty', to: 'myProperties', type: 'direct' },
    // ... más conexiones según flujos
  ]
};
/* ---- TEMP FIX: export util para generar sitemap XML ---- */
export function generateXMLSitemap(pages = []) {
  const safe = (u) => String(u ?? '').trim();
  const urls = (Array.isArray(pages) ? pages : [])
    .filter(Boolean)
    .map((u) => `  <url><loc>${safe(u)}</loc></url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
