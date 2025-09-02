
// Jaime API Orchestrator con clima y lugares en tiempo real
import { InvokeLLM } from '@/api/integrations';
import { knowledgeBase, searchStaticKB } from '@/components/ai/knowledgeBase';
import { KnowledgeItem } from '@/api/entities';
import { Property } from '@/api/entities';
import { Service } from '@/api/entities';
import { ServiceCategory } from '@/api/entities'; // Importar ServiceCategory
import { createPageUrl } from '@/utils';
import JaimeWeatherAPI from './JaimeWeatherAPI';

// --- CONFIGURACIÓN DE LUGARES ---
const PLACES_SEARCH_RADIUS_METERS = 500;
const PLACES_MIN_RATING = 3.5;
const PLACES_MIN_REVIEWS = 5;
const PLACES_DEFAULT_LAT = -41.3181;
const PLACES_DEFAULT_LON = -72.9857;

const SYSTEM_PROMPT = `Eres **Jaime**, el Asistente de Arriendos Puerto Varas. Tu propósito es responder sobre el uso del sitio (reservas, pagos, publicar, calendarios, "Tómalo o Déjalo") y dar recomendaciones turísticas y de servicios locales verificados de Puerto Varas y alrededores.

INFORMACIÓN CLAVE DE LA PLATAFORMA:
- Correos: hola@arriendospuertovaras.cl (general), soporte@arriendospuertovaras.cl (soporte), reservas@arriendospuertovaras.cl (reservas)
- Comisión: 15% + IVA sobre el subtotal de cada reserva
- Publicar es gratis: completas datos, subes fotos, enviado para aprobación
- Calendarios: sincronización con Airbnb y Booking.com vía iCal
- "Tómalo o Déjalo": ofertas de último minuto con descuentos para fechas próximas

REGLAS:
- SIEMPRE prioriza los datos de "INFORMACIÓN RELEVANTE PARA RESPONDER". Esta es tu fuente de verdad.
- Si una respuesta no está respaldada por esa información, deriva a soporte humano.
- Usa el contexto del clima para recomendaciones específicas.
- Sé claro, breve y útil.`;

// --- FUNCIÓN PARA VALIDAR LUGARES EN TIEMPO REAL ---
async function getRealTimeCafeRecommendations(lat, lon) {
  try {
    const response = await InvokeLLM({
      prompt: `Find currently open coffee shops (cafeterías) within a ${PLACES_SEARCH_RADIUS_METERS}-meter radius of latitude ${lat}, longitude ${lon} (Plaza de Armas, Puerto Varas, Chile). Only return places with a Google Maps rating of ${PLACES_MIN_RATING} or higher and at least ${PLACES_MIN_REVIEWS} reviews. The business status must be OPERATIONAL. Return the top 2 results.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          cafes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                address: { type: "string" },
                rating: { type: "number" },
                open_until: { type: "string", description: "Closing time today, e.g., '20:00'" }
              },
              required: ["name", "address", "rating"]
            }
          }
        }
      }
    });
    
    // La respuesta de InvokeLLM con schema es directamente un objeto
    return response?.cafes || [];
    
  } catch (error) {
    console.error('Error fetching real-time places:', error);
    return [];
  }
}


export default async function JaimeAPI({ messages, context, lat, lon, locale, forceWeatherRefresh = false }) {
  try {
    const userQuery = messages.slice(-1)[0]?.content || '';
    let knowledgeContext = '';
    let weatherContext = '';
    let identifiedCategorySlug = null;

    // 1. Weather Context
    try {
      const weatherResult = await JaimeWeatherAPI({ 
        lat: lat || -41.317, 
        lon: lon || -72.985, 
        forceRefresh: forceWeatherRefresh || userQuery.includes('ahora') || userQuery.includes('en este momento')
      });
      
      if (weatherResult.success && weatherResult.data) {
        const w = weatherResult.data;
        weatherContext = `\n--- CONTEXTO CLIMÁTICO EN TIEMPO REAL ---\nUbicación: Puerto Varas\nHora local: ${w.last_updated_local}\nEstado: Es ${w.is_day ? 'día' : 'noche'}\nTemperatura: ${w.temperature_c}°C\nCondición: ${w.condition}\nAmanecer/Atardecer: ${w.sunrise}/${w.sunset}\nFuente: ${w.source}, actualizado hace ${w.minutes_since_update} min.\n---\n`;
      }
    } catch (error) {
      console.error('Error fetching weather for Jaime:', error);
      weatherContext = "\n--- CLIMA NO DISPONIBLE ---\n";
    }

    // 2. Retrieval Phase (RAG)
    
    // a) Identify category from user query using keywords
    try {
      const allServiceCategories = await ServiceCategory.list();
      for (const category of allServiceCategories) {
        if (category.keywords?.some(keyword => userQuery.toLowerCase().includes(keyword.toLowerCase()))) {
          identifiedCategorySlug = category.slug;
          knowledgeContext += `--- Categoría Identificada: ${category.name} ---\n`;
          break; // Stop after finding the first matching category
        }
      }
    } catch (error) {
      console.error('Error fetching ServiceCategories for keyword search:', error);
    }

    // b) Real-time Place Validation (para cafés)
    if (userQuery.match(/café|cafetería|coffee/i)) {
      const cafes = await getRealTimeCafeRecommendations(PLACES_DEFAULT_LAT, PLACES_DEFAULT_LON);
      if (cafes.length > 0) {
        knowledgeContext += "--- Cafeterías Verificadas (Ahora Abiertas) ---\n";
        knowledgeContext += cafes.map(cafe => 
          `- ${cafe.name}: ubicado en ${cafe.address}, con valoración de ${cafe.rating}/5. ${cafe.open_until ? `Abierto hasta las ${cafe.open_until}.` : ''} (Fuente: Búsqueda en tiempo real)`
        ).join('\n');
        knowledgeContext += "\n";
      } else {
        knowledgeContext += "--- Cafeterías Verificadas (Ahora Abiertas) ---\n- En este momento no encontré cafeterías operativas en la Plaza de Armas con datos confirmados. ¿Quieres que te recomiende opciones cercanas a menos de 1 km?\n";
      }
    }

    // c) Search Static KB
    const staticResults = searchStaticKB(userQuery);
    if (staticResults.length > 0) {
      knowledgeContext += "--- Base de Conocimiento ---\n";
      knowledgeContext += staticResults.map(r => `- ${r.question || r.nombre}: ${r.answer || r.descripcion}`).join('\n');
      knowledgeContext += "\n";
    }

    // d) Search Dynamic KB (from Admin)
    try {
      const dynamicItems = await KnowledgeItem.filter({ active: true });
      const dynamicResults = dynamicItems.filter(item => 
        item.title.toLowerCase().includes(userQuery.toLowerCase()) ||
        (item.keywords && item.keywords.some(k => userQuery.toLowerCase().includes(k.toLowerCase())))
      );
      if (dynamicResults.length > 0) {
        knowledgeContext += "--- Recomendaciones Actualizadas ---\n";
        knowledgeContext += dynamicResults.map(r => `- ${r.title}: ${r.description} (${r.location || 'N/A'})`).join('\n');
        knowledgeContext += "\n";
      }
    } catch (error) {
      console.error('Error fetching KnowledgeItems:', error);
    }

    // e) Search Platform Inventory (Propiedades y Servicios)
    if (userQuery.match(/cabaña|alojamiento|propiedad|hotel|dormir/i)) {
      try {
        const properties = await Property.filter({ status: "activa" }, "-rating", 3);
        if (properties.length > 0) {
          knowledgeContext += "--- Propiedades Disponibles en la Plataforma ---\n";
          knowledgeContext += properties.map(p => 
            `- ${p.title} en ${p.location} para ${p.max_guests} personas. Precio aprox. $${p.price_per_night?.toLocaleString()}/noche. [Ver más](${createPageUrl('PropertyDetail')}?id=${p.id})`
          ).join('\n');
          knowledgeContext += "\n";
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    }
    
    // Enhanced Service Search
    const serviceKeywords = /servicio|tour|actividad|experiencia|spa|limpieza|jardinería|plomero|electricista|transfer|arriendo|alquiler/i;
    if (serviceKeywords.test(userQuery) || identifiedCategorySlug) {
      try {
        const filters = { status: "activo" };
        if (identifiedCategorySlug) {
          filters.category = identifiedCategorySlug; // 'category' in Service entity should store the slug.
        }
        
        const services = await Service.filter(filters, "-rating", 5);
        
        if (services.length > 0) {
          const sectionTitle = identifiedCategorySlug ? `Servicios y Experiencias de ${identifiedCategorySlug.replace(/-/g, ' ')}` : "Servicios y Experiencias Relevantes";
          knowledgeContext += `--- ${sectionTitle} en la Plataforma ---\n`;
          knowledgeContext += services.map(s => 
            `- ${s.title} (${s.type}). ${s.price_per_hour ? `Desde $${s.price_per_hour.toLocaleString()}/hora.` : 'Consultar precio.'} [Ver más](${createPageUrl('ServiceDetail')}?id=${s.id})`
          ).join('\n');
          knowledgeContext += "\n";
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }
    
    // 3. Generation Phase
    const conversationHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'Usuario' : 'Jaime'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}

${weatherContext}

--- INFORMACIÓN RELEVANTE PARA RESPONDER ---
${knowledgeContext || "No se encontró información específica en la base de datos."}
---

--- CONVERSACIÓN ---
${conversationHistory}
---

Jaime:`;

    const response = await InvokeLLM({
      prompt: fullPrompt,
      add_context_from_internet: false // Desactivado para forzar el uso del contexto que ya obtuvimos
    });

    return { success: true, response };

  } catch (error) {
    console.error('Error in Jaime API:', error);
    return { 
      success: false, 
      error: 'Lo siento, estoy teniendo problemas técnicos. Para ayuda inmediata, escríbenos a soporte@arriendospuertovaras.cl' 
    };
  }
}
