
// Base de conocimiento estática para Jaime
// Esta información es el fallback y conocimiento central que no cambia a menudo.
// La información dinámica (restaurantes, eventos) se cargará desde la entidad 'KnowledgeItem'.

export const knowledgeBase = [
  // Categoria: Plataforma
  {
    category: "Plataforma",
    question: "¿Cuáles son los correos de contacto?",
    answer: "Para consultas generales: hola@arriendospuertovaras.cl, para soporte: soporte@arriendospuertovaras.cl, para reservas: reservas@arriendospuertovaras.cl, y para temas de empleo: empleo@arriendospuertovaras.cl.",
    keywords: ["emails", "contacto", "correo", "soporte", "reservas", "empleo", "general"]
  },
  {
    category: "Plataforma",
    question: "¿Quiénes somos?",
    answer: "Somos una plataforma local de Puerto Varas que conecta propiedades, servicios y experiencias para impulsar la economía local. Nuestro diferenciador es que permitimos a los operadores colaborar entre sí, creando paquetes turísticos y manteniendo calendarios sincronizados.",
    keywords: ["quienes somos", "nosotros", "plataforma", "misión"]
  },
  {
    category: "Plataforma",
    question: "¿Cuál es la comisión de Arriendos Puerto Varas?",
    answer: "Nuestra comisión es del 15% + IVA sobre el valor total de la reserva, que se deduce del pago que recibe el anfitrión. Publicar tu propiedad es completamente gratis.",
    keywords: ["comisión", "fee", "costo", "tarifa", "precios", "porcentaje"]
  },
  {
    category: "Plataforma",
    question: "¿Cómo publicar mi propiedad en Arriendos Puerto Varas?",
    answer: "Publicar es gratis. Vas a 'Conviértete en anfitrión' o 'Publica tu propiedad', completas los datos, subes fotos y lo envías para aprobación. También puedes sincronizar tus calendarios de Airbnb y Booking.com vía iCal.",
    keywords: ["publicar", "anfitrión", "propiedad", "registro", "gratis"]
  },
  {
    category: "Plataforma",
    question: "¿Cómo funciona el botón 'Cómo llegar'?",
    answer: "El botón 'Cómo llegar' en cada anuncio abre Google Maps o Apple Maps en tu dispositivo para guiarte directamente a la propiedad.",
    keywords: ["cómo llegar", "ubicación", "mapas", "dirección"]
  },
  {
    category: "Plataforma",
    question: "¿Qué es el dashboard de administrador?",
    answer: "El dashboard de administrador permite gestionar todas las consultas desde un solo lugar, con bandejas de entrada por categoría. Las respuestas se envían directamente al email del usuario.",
    keywords: ["dashboard", "administrador", "gestión", "consultas"]
  },

  // Categoria: FAQ - Reservas
  {
    category: "Reservas",
    question: "¿Cómo hago una reserva?",
    answer: "Para hacer una reserva: 1) Busca la propiedad que te interesa, 2) Selecciona fechas y huéspedes, 3) Revisa precios, 4) Completa tus datos, 5) Procede al pago. Recibirás confirmación por email.",
    deeplink: "/properties",
    keywords: ["reserva", "reservar", "proceso", "pasos"]
  },
  {
    category: "Reservas",
    question: "¿Puedo cancelar mi reserva?",
    answer: "Las cancelaciones dependen de la política de cada propiedad. Revisa los términos en tu confirmación. Generalmente hay cancelación gratuita hasta 48h antes del check-in.",
    deeplink: "/help/cancelaciones",
    keywords: ["cancelar", "cancelación", "política", "reembolso"]
  },
  {
    category: "Reservas",
    question: "¿Cómo funciona el pago?",
    answer: "Aceptamos tarjetas de crédito/débito y transferencia bancaria. El pago se procesa seguro. Aplicamos comisión del 15% + IVA sobre el valor total de la reserva.",
    deeplink: "/help/pagos",
    keywords: ["pago", "pagar", "métodos de pago", "seguridad"]
  },

  // Categoria: FAQ - Publicar
  {
    category: "Publicar",
    question: "¿Cómo publico mi propiedad?",
    answer: "Para publicar: 1) Regístrate como anfitrión, 2) Completa formulario con detalles, 3) Sube fotos de calidad, 4) Establece precios y disponibilidad, 5) Envía para aprobación. ¡Es gratis!",
    deeplink: "/add-property",
    keywords: ["publicar", "anfitrión", "propiedad", "registro"]
  },
  {
    category: "Publicar",
    question: "¿Cómo sincronizo calendarios?",
    answer: "Para sincronizar: 1) Ve a 'Mis Propiedades', 2) Selecciona propiedad, 3) En 'Calendario', agrega URLs iCal de Airbnb y Booking, 4) Sincronización automática cada 6 horas.",
    deeplink: "/my-properties",
    keywords: ["sincronizar", "calendarios", "iCal", "airbnb", "booking"]
  },
  {
    category: "Publicar",
    question: '¿Cómo funciona la sincronización de calendarios?',
    answer: 'Puedes sincronizar tus calendarios de Airbnb y Booking.com con nuestra plataforma usando el formato iCal. En la sección "Mis Propiedades", edita una propiedad y encontrarás las opciones para pegar las URLs de iCal de importación. También te proporcionamos una URL de iCal para que la uses en otras plataformas.',
    keywords: ["sincronizar", "calendarios", "iCal", "airbnb", "booking"]
  },

  // Categoria: FAQ - General
  {
    category: "General",
    question: '¿Cómo funcionan los paquetes automáticos?',
    answer: 'Nuestra plataforma puede agrupar automáticamente un alojamiento con un vehículo, servicio o experiencia de diferentes operadores. Si tu publicación participa, se le puede aplicar un descuento (entre 10% y 80%) para incentivar reservas más completas. Esto aumenta tu visibilidad y potencial de ingresos.',
    keywords: ["paquetes", "descuento", "bundle", "operadores"]
  },
  {
    category: "General",
    question: '¿Qué es "Tómalo o Déjalo"?',
    answer: 'Es nuestro sistema de ofertas de último minuto. Los anfitriones pueden configurar descuentos automáticos para fechas cercanas que no se han reservado. Los usuarios pueden encontrar grandes ofertas y los anfitriones evitan tener su propiedad vacía.',
    keywords: ["tómalo o déjalo", "ofertas", "último minuto", "descuentos"]
  },
  {
    category: "General",
    question: '¿Cuál es el correo de soporte?',
    answer: 'Nuestro correo de soporte es soporte@arriendospuertovaras.cl. Para consultas generales, puedes usar hola@arriendospuertovaras.cl y para temas de reservas, reservas@arriendospuertovaras.cl.',
    keywords: ["soporte", "correo", "contacto", "emails"]
  },
  {
    category: "General",
    question: "¿Cuál es la comisión de Arriendos Puerto Varas?",
    answer: "Nuestra comisión es del 15% + IVA (19% sobre la tarifa de servicio) sobre el valor total de la reserva, que se deduce del pago que recibe el anfitrión. Publicar tu propiedad es completamente gratis.",
    keywords: ["comisión", "fee", "costo", "tarifa", "precios", "porcentaje", "iva"]
  },

  // Categoria: Guía de Puerto Varas - General
  {
    category: "Guía de Puerto Varas",
    question: "¿Cuál es la descripción general de Puerto Varas?",
    answer: "Puerto Varas, 'La Ciudad de las Rosas', está a orillas del Lago Llanquihue con vistas a los volcanes Osorno y Calbuco. Es el corazón turístico de la Región de Los Lagos.",
    keywords: ["puerto varas", "descripción", "ciudad", "llanquihue", "osorno", "calbuco"],
    originalType: "general_guide"
  },
  {
    category: "Guía de Puerto Varas",
    question: "¿Cuál es el clima en Puerto Varas?",
    answer: "Clima templado lluvioso. Verano (dic-mar): 15-25°C, seco. Invierno (jun-ago): 5-12°C, lluvioso. Siempre llevar ropa impermeable.",
    keywords: ["clima", "tiempo", "temperatura", "estaciones"],
    originalType: "general_guide"
  },
  {
    category: "Guía de Puerto Varas",
    question: "¿Cómo es el transporte en Puerto Varas?",
    answer: "Buses locales, colectivos, transfers al aeropuerto PMC, arriendo de autos. La mayoría de atracciones requieren vehículo o tour.",
    keywords: ["transporte", "movilidad", "buses", "autos", "aeropuerto"],
    originalType: "general_guide"
  },
  {
    category: "Guía de Puerto Varas",
    question: "¿Cuáles son los números de emergencia en Puerto Varas?",
    answer: "Hospital de Puerto Varas: (65) 233 5200. Farmacias de turno se publican en diarios locales.",
    keywords: ["emergencias", "hospital", "farmacias", "ayuda"],
    originalType: "general_guide"
  },

  // Categoria: Guía de Puerto Varas - Atracciones Principales
  {
    category: "Guía de Puerto Varas - Atracciones",
    question: "¿Qué es el Volcán Osorno?",
    answer: "El Volcán Osorno es un volcán cónico perfecto. Ofrece centro de ski en invierno y trekking en verano con vistas panorámicas. Se encuentra a 1 hora en auto desde Puerto Varas. Es accesible todo el año (Ski: jun-sep, Trekking: oct-abr). Consejo: Consultar clima antes de subir, el camino está pavimentado con curvas y hay cafetería en la base.",
    originalType: "atraccion",
    nombre: "Volcán Osorno", // Keep original name for consistency
    keywords: ["volcán osorno", "ski", "trekking", "panorámicas"]
  },
  {
    category: "Guía de Puerto Varas - Atracciones",
    question: "¿Qué son los Saltos del Petrohué?",
    answer: "Los Saltos del Petrohué son cascadas de agua turquesa sobre roca volcánica ubicadas en el Parque Nacional Vicente Pérez Rosales. Se encuentran a 45 minutos en auto desde Puerto Varas. Son visitables todo el año, siendo más espectaculares con el caudal de primavera/otoño. Consejo: La entrada es pagada y hay senderos habilitados para toda la familia.",
    originalType: "atraccion",
    nombre: "Saltos del Petrohué",
    keywords: ["saltos petrohué", "cascadas", "parque nacional", "río"]
  },
  {
    category: "Guía de Puerto Varas - Atracciones",
    question: "¿Qué se puede hacer en el Lago Llanquihue?",
    answer: "El Lago Llanquihue es el segundo lago más grande de Chile. Se pueden realizar actividades como kayak, paddle, navegación y pesca. Se encuentra directamente en Puerto Varas (costanera). Es accesible todo el año, con deportes acuáticos entre noviembre y marzo. Consejo: Sus aguas son frías incluso en verano. La costanera es ideal para atardeceres.",
    originalType: "atraccion",
    nombre: "Lago Llanquihue",
    keywords: ["lago llanquihue", "kayak", "paddle", "navegación", "pesca"]
  },

  // Categoria: Guía de Puerto Varas - Pueblos Cercanos
  {
    category: "Guía de Puerto Varas - Pueblos Cercanos",
    question: "¿Qué puedo encontrar en Frutillar?",
    answer: "Frutillar es conocido por su arquitectura alemana, el Museo Colonial Alemán y el Teatro del Lago de clase mundial. Está a 30 min en auto o 45 min en bus desde Puerto Varas. Destacado: Es sede del Festival de Música Clásica (ene-feb) y es un lugar ideal para probar kuchen tradicional.",
    originalType: "pueblo_cercano",
    nombre: "Frutillar",
    keywords: ["frutillar", "arquitectura alemana", "teatro del lago", "kuchen", "festival"]
  },
  {
    category: "Guía de Puerto Varas - Pueblos Cercanos",
    question: "¿Qué hay en Ensenada?",
    answer: "Ensenada es un poblado situado en la base del Volcán Osorno, ideal para deportes de aventura y excursiones. Se encuentra a 25 min en auto desde Puerto Varas. Destacado: Cuenta con playas de arena volcánica y es un punto de partida para trekking.",
    originalType: "pueblo_cercano",
    nombre: "Ensenada",
    keywords: ["ensenada", "deportes de aventura", "playas", "trekking"]
  },
  {
    category: "Guía de Puerto Varas - Pueblos Cercanos",
    question: "¿Qué se destaca de Puerto Octay?",
    answer: "Puerto Octay es un pueblo pintoresco con vistas privilegiadas del lago y volcán. Se encuentra a 45 min en auto desde Puerto Varas. Destacado: Es un punto de vista ideal para la fotografía del Osorno.",
    originalType: "pueblo_cercano",
    nombre: "Puerto Octay",
    keywords: ["puerto octay", "pintoresco", "vistas", "fotografía"]
  },

  // Categoria: Guía de Puerto Varas - Recomendaciones por Clima
  {
    category: "Guía de Puerto Varas - Clima",
    question: "¿Qué actividades puedo hacer en Puerto Varas si llueve?",
    answer: "Si llueve, puedes visitar el Museo Pablo Fierro, probar cafeterías locales en el centro, ir al Teatro del Lago en Frutillar (si hay programación), visitar centros comerciales y galerías de arte, o disfrutar de un spa y termas techadas.",
    originalType: "recomendacion_clima",
    originalKeyword: "lluvia",
    keywords: ["lluvia", "lluvioso", "mal tiempo", "actividades indoor"]
  },
  {
    category: "Guía de Puerto Varas - Clima",
    question: "¿Qué actividades puedo hacer en Puerto Varas si está soleado?",
    answer: "Si está soleado, puedes hacer trekking al Volcán Osorno, kayak en el Lago Llanquihue, visitar los Saltos del Petrohué, caminar por la costanera de Puerto Varas, o hacer una excursión a Puerto Octay.",
    originalType: "recomendacion_clima",
    originalKeyword: "soleado",
    keywords: ["sol", "soleado", "buen tiempo", "despejado", "actividades outdoor"]
  }
];

// Función para buscar en la base de conocimiento estática
export function searchStaticKB(query) {
  const lowerQuery = query.toLowerCase();
  let results = [];

  knowledgeBase.forEach(item => {
    const matchesQuestion = item.question && item.question.toLowerCase().includes(lowerQuery);
    const matchesAnswer = item.answer && item.answer.toLowerCase().includes(lowerQuery);
    const matchesKeywords = item.keywords && item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery));

    if (matchesQuestion || matchesAnswer || matchesKeywords) {
      // Reconstruct result object to be similar to previous types for compatibility
      let resultItem = { ...item }; // Start with all item properties

      // Determine 'source' and 'type' for compatibility with old search results
      if (item.category.startsWith("FAQ")) { // Catch FAQ categories like "FAQ - Reservas" or "FAQ - Publicar" etc.
        resultItem.source = 'FAQ';
        resultItem.type = 'faq';
      } else if (item.category.startsWith("Guía de Puerto Varas")) {
        resultItem.source = 'Guía Local';
        if (item.originalType) {
          resultItem.type = item.originalType;
        } else {
          resultItem.type = 'general_guide_item'; // A new type for general guide items
        }

        // Special handling for recommendations_clima to match original structure
        if (item.originalType === 'recomendacion_clima') {
          // The old 'recomendaciones' was an array, now it's part of 'answer'
          // We need to parse it back into an array for compatibility
          const recommendationsArray = item.answer
            .replace(/Si (llueve|está soleado), puedes /, '') // Remove introductory phrase
            .split(',') // Split by comma
            .map(rec => rec.trim()) // Trim whitespace
            .filter(rec => rec); // Remove empty strings

          resultItem.recomendaciones = recommendationsArray;

          if (item.originalKeyword === 'lluvia') {
            resultItem.nombre = 'Actividades para día lluvioso';
          } else if (item.originalKeyword === 'soleado') {
            resultItem.nombre = 'Actividades para buen tiempo';
          }
        }
      } else { // For 'Plataforma' category items
        resultItem.source = 'Plataforma';
        resultItem.type = 'plataforma_info'; // A new type for general platform info
      }

      // Add 'nombre' if it's an attraction/pueblo_cercano and not already set
      if ((resultItem.type === 'atraccion' || resultItem.type === 'pueblo_cercano') && !resultItem.nombre) {
        resultItem.nombre = item.question; // Or a more suitable field if available
      } else if (!resultItem.nombre && item.question) {
        // Fallback for general items that might not have a specific 'nombre'
        resultItem.nombre = item.question;
      }
      
      // Ensure unique results based on question/answer pair
      if (!results.some(r => r.question === item.question && r.answer === item.answer)) {
        results.push(resultItem);
      }
    }
  });

  // Also check specific climate keywords directly for broad match even if not in item keywords/QA
  // This mimics the specific previous logic which looked for these terms directly in the query.
  // We'll add these if they haven't been added already by the general loop.
  const hasLluviaRec = results.some(r => r.type === 'recomendacion_clima' && r.originalKeyword === 'lluvia');
  const hasSolRec = results.some(r => r.type === 'recomendacion_clima' && r.originalKeyword === 'soleado');

  if (!hasLluviaRec && (lowerQuery.includes('lluvia') || lowerQuery.includes('lluvioso'))) {
    const lluviaItem = knowledgeBase.find(item => item.originalType === 'recomendacion_clima' && item.originalKeyword === 'lluvia');
    if (lluviaItem) {
        const recommendationsArray = lluviaItem.answer
            .replace(/Si llueve, puedes /, '')
            .split(',')
            .map(rec => rec.trim())
            .filter(rec => rec);
      results.push({
        ...lluviaItem,
        source: 'Guía Local',
        type: 'recomendacion_clima',
        nombre: 'Actividades para día lluvioso',
        recomendaciones: recommendationsArray
      });
    }
  }

  if (!hasSolRec && (lowerQuery.includes('sol') || lowerQuery.includes('buen tiempo') || lowerQuery.includes('despejado'))) {
    const solItem = knowledgeBase.find(item => item.originalType === 'recomendacion_clima' && item.originalKeyword === 'soleado');
    if (solItem) {
        const recommendationsArray = solItem.answer
            .replace(/Si está soleado, puedes /, '')
            .split(',')
            .map(rec => rec.trim())
            .filter(rec => rec);
      results.push({
        ...solItem,
        source: 'Guía Local',
        type: 'recomendacion_clima',
        nombre: 'Actividades para buen tiempo',
        recomendaciones: recommendationsArray
      });
    }
  }

  return results;
}

// Función para búsqueda de conocimiento (alias para compatibilidad)
export function searchKnowledge(query) {
  return searchStaticKB(query);
}
