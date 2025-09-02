// Mapa completo del sitio ArriendosPuertoVaras.cl
// Este archivo contiene toda la estructura del sitio para generar el mapa visual y checklist

export const siteStructure = {
  // NIVEL 1: PÁGINAS PRINCIPALES
  mainPages: {
    home: {
      name: "Página Principal",
      url: "/",
      component: "Home",
      description: "Landing page con hero, categorías, propiedades destacadas",
      features: ["Hero dinámico", "Categorías", "Propiedades destacadas", "Newsletter", "CTA anfitrión"],
      userStates: ["Público", "Usuario logueado", "Anfitrión"]
    },
    properties: {
      name: "Explorar Propiedades",
      url: "/Properties",
      component: "Properties",
      description: "Listado completo de propiedades con filtros",
      features: ["Búsqueda", "Filtros avanzados", "Vista grid/lista", "Paginación"],
      userStates: ["Público", "Usuario logueado"]
    },
    services: {
      name: "Servicios y Experiencias",
      url: "/Services",
      component: "Services",
      description: "Catálogo de servicios profesionales y experiencias",
      features: ["Filtros por tipo", "Tabs servicios/experiencias", "Cards informativos"],
      userStates: ["Público", "Usuario logueado"]
    }
  },

  // NIVEL 2: PÁGINAS DE DETALLE Y GESTIÓN
  detailPages: {
    propertyDetail: {
      name: "Detalle de Propiedad",
      url: "/PropertyDetail?id=:id",
      component: "PropertyDetail",
      description: "Vista completa de una propiedad específica",
      features: ["Galería de imágenes", "Formulario reserva", "Mapa", "Reseñas", "Perfil anfitrión"],
      userStates: ["Público", "Usuario logueado", "Propietario"]
    },
    serviceDetail: {
      name: "Detalle de Servicio",
      url: "/ServiceDetail?id=:id",
      component: "ServiceDetail",
      description: "Vista completa de un servicio específico",
      features: ["Información del proveedor", "Formulario reserva", "Disponibilidad"],
      userStates: ["Público", "Usuario logueado", "Proveedor"]
    }
  },

  // NIVEL 3: GESTIÓN DE USUARIO
  userManagement: {
    profile: {
      name: "Perfil de Usuario",
      url: "/Profile",
      component: "Profile",
      description: "Gestión de datos personales y bancarios",
      features: ["Datos personales", "Verificación", "Configuración bancaria"],
      userStates: ["Usuario logueado"],
      authRequired: true
    },
    miCuenta: {
      name: "Mi Cuenta",
      url: "/MiCuenta",
      component: "MiCuenta",
      description: "Dashboard principal del usuario",
      features: ["Resumen", "Accesos rápidos", "Notificaciones"],
      userStates: ["Usuario logueado"],
      authRequired: true
    },
    myBookings: {
      name: "Mis Reservas",
      url: "/MyBookings",
      component: "MyBookings",
      description: "Historial de reservas del usuario",
      features: ["Lista reservas", "Estados", "Filtros por fecha"],
      userStates: ["Usuario logueado"],
      authRequired: true
    }
  },

  // NIVEL 4: GESTIÓN DE ANFITRIÓN
  hostManagement: {
    myProperties: {
      name: "Mis Propiedades",
      url: "/MyProperties",
      component: "MyProperties",
      description: "Gestión de propiedades del anfitrión",
      features: ["Lista propiedades", "Estados", "Estadísticas básicas"],
      userStates: ["Anfitrión"],
      authRequired: true
    },
    addProperty: {
      name: "Publicar/Editar Propiedad",
      url: "/AddProperty",
      component: "AddProperty",
      description: "Formulario completo para publicar propiedades",
      features: ["Wizard multi-paso", "Subida imágenes", "Comodidades", "Precios"],
      userStates: ["Anfitrión"],
      authRequired: true
    },
    myServices: {
      name: "Mis Servicios",
      url: "/MyServices",
      component: "MyServices",
      description: "Gestión de servicios del proveedor",
      features: ["Lista servicios", "Estados", "Reservas recibidas"],
      userStates: ["Anfitrión"],
      authRequired: true
    },
    addService: {
      name: "Publicar/Editar Servicio",
      url: "/AddService",
      component: "AddService",
      description: "Formulario para servicios y experiencias",
      features: ["Tipo servicio/experiencia", "Precios", "Disponibilidad"],
      userStates: ["Anfitrión"],
      authRequired: true
    },
    dashboard: {
      name: "Dashboard IA",
      url: "/Dashboard",
      component: "Dashboard",
      description: "Analytics y recomendaciones IA",
      features: ["Métricas", "Recomendaciones precios", "Alertas inteligentes"],
      userStates: ["Anfitrión"],
      authRequired: true
    }
  },

  // NIVEL 5: FUNCIONES ESPECIALES
  specialFeatures: {
    lastMinuteDeals: {
      name: "Tómalo o Déjalo",
      url: "/LastMinuteDeals",
      component: "LastMinuteDeals",
      description: "Ofertas de último minuto",
      features: ["Ofertas disponibles", "Countdown", "Reserva rápida"],
      userStates: ["Público", "Usuario logueado"]
    },
    becomeHost: {
      name: "Conviértete en Anfitrión",
      url: "/BecomeHost",
      component: "BecomeHost",
      description: "Landing para nuevos anfitriones",
      features: ["Información", "Beneficios", "Formulario lead"],
      userStates: ["Público", "Usuario logueado"]
    },
    hostWizard: {
      name: "Asistente de Anfitrión",
      url: "/HostWizard",
      component: "HostWizard",
      description: "Onboarding guiado para nuevos anfitriones",
      features: ["Pasos guiados", "Configuración inicial", "Primera publicación"],
      userStates: ["Nuevo anfitrión"],
      authRequired: true
    }
  },

  // NIVEL 6: CONTENIDO Y AYUDA
  contentPages: {
    blog: {
      name: "Blog",
      url: "/Blog",
      component: "Blog",
      description: "Artículos y noticias sobre turismo",
      features: ["Lista artículos", "Categorías", "SEO optimizado"],
      userStates: ["Público", "Usuario logueado"]
    },
    blogPost: {
      name: "Artículo de Blog",
      url: "/BlogPostDetail?slug=:slug",
      component: "BlogPostDetail",
      description: "Vista de artículo individual",
      features: ["Contenido markdown", "Jaime integration", "Schema.org"],
      userStates: ["Público", "Usuario logueado"]
    },
    helpCenter: {
      name: "Centro de Ayuda",
      url: "/HelpCenter",
      component: "HelpCenter",
      description: "FAQ y documentación",
      features: ["Categorías FAQ", "Búsqueda", "Artículos ayuda"],
      userStates: ["Público", "Usuario logueado"]
    },
    helpCategory: {
      name: "Categoría de Ayuda",
      url: "/HelpCategory?slug=:slug",
      component: "HelpCategory",
      description: "FAQ por categoría específica",
      features: ["Lista FAQ filtrada", "Navegación"],
      userStates: ["Público", "Usuario logueado"]
    },
    helpArticle: {
      name: "Artículo de Ayuda",
      url: "/HelpArticle?slug=:slug",
      component: "HelpArticle",
      description: "Artículo detallado de ayuda",
      features: ["Contenido markdown", "Navegación contextual"],
      userStates: ["Público", "Usuario logueado"]
    }
  },

  // NIVEL 7: SERVICIOS PROFESIONALES
  professionalServices: {
    servicesHub: {
      name: "Hub de Servicios",
      url: "/ServicesHub",
      component: "ServicesHub",
      description: "Catálogo completo de servicios profesionales",
      features: ["Categorías servicios", "Búsqueda", "Filtros"],
      userStates: ["Público", "Usuario logueado"]
    },
    serviceCategory: {
      name: "Categoría de Servicio",
      url: "/ServiceCategory?slug=:slug",
      component: "ServiceCategory",
      description: "Servicios por categoría específica",
      features: ["Lista filtrada", "Información categoría"],
      userStates: ["Público", "Usuario logueado"]
    }
  },

  // NIVEL 8: PÁGINAS LEGALES
  legalPages: {
    termsAndConditions: {
      name: "Términos y Condiciones",
      url: "/TermsAndConditions",
      component: "TermsAndConditions",
      description: "Términos legales de uso",
      features: ["Contenido legal", "Última actualización"],
      userStates: ["Público", "Usuario logueado"]
    },
    privacyPolicy: {
      name: "Política de Privacidad",
      url: "/PrivacyPolicy",
      component: "PrivacyPolicy",
      description: "Política de tratamiento de datos",
      features: ["GDPR compliant", "Cookies", "Datos personales"],
      userStates: ["Público", "Usuario logueado"]
    }
  },

  // NIVEL 9: FUNCIONES ADMINISTRATIVAS
  adminFeatures: {
    seoManagement: {
      name: "Gestión SEO",
      url: "/SEOManagement",
      component: "SEOManagement",
      description: "Panel de administración SEO",
      features: ["Configuración SEO", "A/B Testing", "Analytics"],
      userStates: ["Admin"],
      authRequired: true,
      adminOnly: true
    },
    adminSEO: {
      name: "Admin SEO",
      url: "/AdminSEO",
      component: "AdminSEO",
      description: "Herramientas avanzadas SEO",
      features: ["Templates", "Bulk editing", "Performance"],
      userStates: ["Admin"],
      authRequired: true,
      adminOnly: true
    }
  },

  // NIVEL 10: INTEGRACIONES Y IA
  aiIntegrations: {
    asistenteJaime: {
      name: "Asistente Jaime",
      url: "/AsistenteJaime",
      component: "AsistenteJaime",
      description: "Chat bot de soporte turístico",
      features: ["Chat inteligente", "Base conocimiento", "Integración global"],
      userStates: ["Público", "Usuario logueado"]
    },
    referralProgram: {
      name: "Programa de Referencias",
      url: "/ReferralProgram",
      component: "ReferralProgram",
      description: "Sistema de referidos",
      features: ["Códigos referidos", "Recompensas", "Tracking"],
      userStates: ["Usuario logueado"],
      authRequired: true
    }
  }
};

// Funciones clave del sitio
export const siteFunctions = {
  search: {
    name: "Sistema de Búsqueda",
    description: "Búsqueda global de propiedades y servicios",
    locations: ["Header", "Home", "Properties", "Services"],
    features: ["Autocompletado", "Filtros", "Geolocalización"]
  },
  booking: {
    name: "Sistema de Reservas",
    description: "Proceso completo de reserva",
    locations: ["PropertyDetail", "ServiceDetail"],
    features: ["Calendario", "Pagos", "Confirmación"]
  },
  authentication: {
    name: "Autenticación",
    description: "Login/registro con Google",
    locations: ["Global"],
    features: ["OAuth Google", "Estados usuario", "Redirecciones"]
  },
  payments: {
    name: "Sistema de Pagos",
    description: "Procesamiento de pagos CLP",
    locations: ["Booking flow"],
    features: ["WebPay", "Comisiones", "Facturación"]
  },
  notifications: {
    name: "Notificaciones",
    description: "Sistema de notificaciones email",
    locations: ["Global"],
    features: ["Transaccionales", "Marketing", "Push"]
  },
  analytics: {
    name: "Analytics",
    description: "Google Analytics 4 integrado",
    id: "G-9ZGG23T6WF",
    locations: ["Global"],
    features: ["Page views", "Events", "Conversions"]
  },
  seo: {
    name: "SEO Avanzado",
    description: "Optimización automática",
    locations: ["Global"],
    features: ["Meta tags", "Schema.org", "Sitemaps"]
  }
};

// Estados condicionales del sitio
export const conditionalStates = {
  userTypes: ["Público", "Usuario registrado", "Arrendatario", "Arrendador", "Admin", "Viewer"],
  propertyStates: ["Activa", "Pausada", "Pendiente aprobación"],
  bookingStates: ["Pendiente", "Confirmada", "Pagada", "Completada", "Cancelada"],
  deviceTypes: ["Desktop", "Tablet", "Mobile"],
  languages: ["Español (CL)", "English (US)"]
};