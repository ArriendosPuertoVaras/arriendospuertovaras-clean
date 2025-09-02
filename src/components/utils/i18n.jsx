import React from 'react';

// Sistema de internacionalización para la aplicación
class I18nManager {
  constructor() {
    this.currentLanguage = this.detectLanguage();
    this.translations = {};
    this.loadTranslations();
  }

  detectLanguage() {
    // 1. Verificar si hay preferencia guardada del usuario
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang && ['es', 'en'].includes(savedLang)) {
      return savedLang;
    }

    // 2. Detectar idioma del navegador
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      const lang = browserLang.split('-')[0].toLowerCase();
      if (['en'].includes(lang)) {
        return lang;
      }
    }

    // 3. Fallback a español
    return 'es';
  }

  loadTranslations() {
    this.translations = {
      es: {
        // Header/Navigation
        'nav.properties': 'Propiedades',
        'nav.services': 'Servicios',
        'nav.home': 'Inicio',
        'nav.login': 'Iniciar Sesión',
        'nav.logout': 'Cerrar Sesión',
        'nav.my_account': 'Mi Cuenta',
        'nav.my_properties': 'Mis Propiedades',
        'nav.my_bookings': 'Mis Reservas',
        'nav.offer_your_space': 'Ofrece tu espacio',
        
        // Common actions
        'common.search': 'Buscar',
        'common.filter': 'Filtrar',
        'common.book_now': 'Reservar Ahora',
        'common.view_details': 'Ver Detalles',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.loading': 'Cargando...',
        'common.back': 'Volver atrás',
        'common.next': 'Continuar',
        'common.previous': 'Anterior',
        
        // Property related
        'property.guests': 'huéspedes',
        'property.bedrooms': 'Dormitorios',
        'property.bathrooms': 'Baños',
        'property.per_night': '/ noche',
        'property.amenities': 'Comodidades',
        'property.location': 'Ubicación',
        'property.reviews': 'reseñas',
        'property.check_in': 'Entrada',
        'property.check_out': 'Salida',
        
        // Home page
        'home.hero_title': 'Descubre el Sur de Chile',
        'home.hero_subtitle': 'Encuentra el alojamiento perfecto en Puerto Varas y alrededores',
        'home.search_placeholder': 'Buscar por ubicación...',
        'home.featured_properties': 'Propiedades Destacadas',
        
        // Search/Filters
        'search.all_categories': 'Todas las categorías',
        'search.cabins': 'Cabañas',
        'search.apartments': 'Departamentos',
        'search.houses': 'Casas',
        'search.vehicles': 'Vehículos',
        'search.experiences': 'Experiencias',
        'search.price_range': 'Rango de precio',
        'search.max_guests': 'Huéspedes',
        'search.any_amount': 'Cualquier cantidad',
        'search.sort_by': 'Ordenar por',
        'search.newest': 'Más recientes',
        'search.price_low_high': 'Precio: menor a mayor',
        'search.price_high_low': 'Precio: mayor a menor',
        'search.best_rated': 'Mejor calificados',

        // Auth
        'auth.logged_in_as': 'Sesión iniciada como',
        'auth.logged_out_message': 'Has cerrado sesión correctamente.',
        
        // Footer
        'footer.assistance': 'Asistencia',
        'footer.help_center': 'Centro de Ayuda',
        'footer.faq': 'Preguntas Frecuentes',
        'footer.cancellation_policies': 'Políticas de Cancelación',
        'footer.security_trust': 'Seguridad y Confianza',
        'footer.contact': 'Contáctanos',
        
        'footer.operators': 'Operadores',
        'footer.become_host': 'Conviértete en anfitrión',
        'footer.list_property': 'Publica tu propiedad',
        'footer.offer_service': 'Ofrece un servicio',
        'footer.offer_experience': 'Ofrece una experiencia',
        'footer.new_advertiser_guide': 'Guía para nuevos anunciantes',

        'footer.about': 'Sobre Nosotros',
        'footer.about_us': 'Quiénes Somos',
        'footer.blog_news': 'Blog y Noticias',
        'footer.user_reviews': 'Opiniones de Usuarios',
        'footer.investors_partners': 'Inversionistas y Partners',
        'footer.work_with_us': 'Trabaja con Nosotros',

        'footer.legal': 'Legal',
        'footer.privacy': 'Privacidad',
        'footer.terms_conditions': 'Términos y Condiciones',
        'footer.cookie_policy': 'Política de Cookies',
        'footer.sitemap': 'Mapa del Sitio',
        'footer.company_data': 'Datos de la Empresa',
        'footer.rights_reserved': 'Todos los derechos reservados.',
        
        // Jaime Chat
        'jaime.have_questions': '¿Tienes dudas?',
        'jaime.ask_jaime': '¡Pregúntale a Jaime!',
        
        // Categories
        'category.cabaña': 'Cabaña',
        'category.departamento': 'Departamento',
        'category.casa': 'Casa',
        'category.vehículo': 'Vehículo',
        'category.actividad': 'Actividad',
      },
      
      en: {
        // Header/Navigation
        'nav.properties': 'Properties',
        'nav.services': 'Services', 
        'nav.home': 'Home',
        'nav.login': 'Login',
        'nav.logout': 'Logout',
        'nav.my_account': 'My Account',
        'nav.my_properties': 'My Properties',
        'nav.my_bookings': 'My Bookings',
        'nav.offer_your_space': 'Offer your space',
        
        // Common actions
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.book_now': 'Book Now',
        'common.view_details': 'View Details',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.loading': 'Loading...',
        'common.back': 'Go back',
        'common.next': 'Continue',
        'common.previous': 'Previous',
        
        // Property related
        'property.guests': 'guests',
        'property.bedrooms': 'Bedrooms',
        'property.bathrooms': 'Bathrooms',
        'property.per_night': '/ night',
        'property.amenities': 'Amenities',
        'property.location': 'Location',
        'property.reviews': 'reviews',
        'property.check_in': 'Check-in',
        'property.check_out': 'Check-out',
        
        // Home page
        'home.hero_title': 'Discover Southern Chile',
        'home.hero_subtitle': 'Find the perfect accommodation in Puerto Varas and surroundings',
        'home.search_placeholder': 'Search by location...',
        'home.featured_properties': 'Featured Properties',
        
        // Search/Filters
        'search.all_categories': 'All categories',
        'search.cabins': 'Cabins',
        'search.apartments': 'Apartments',
        'search.houses': 'Houses',
        'search.vehicles': 'Vehicles',
        'search.experiences': 'Experiences',
        'search.price_range': 'Price range',
        'search.max_guests': 'Guests',
        'search.any_amount': 'Any amount',
        'search.sort_by': 'Sort by',
        'search.newest': 'Newest',
        'search.price_low_high': 'Price: low to high',
        'search.price_high_low': 'Price: high to low',
        'search.best_rated': 'Best rated',

        // Auth
        'auth.logged_in_as': 'Logged in as',
        'auth.logged_out_message': 'You have been logged out successfully.',

        // Footer
        'footer.assistance': 'Assistance',
        'footer.help_center': 'Help Center',
        'footer.faq': 'FAQ',
        'footer.cancellation_policies': 'Cancellation Policies',
        'footer.security_trust': 'Security & Trust',
        'footer.contact': 'Contact Us',
        
        'footer.operators': 'Operators',
        'footer.become_host': 'Become a host',
        'footer.list_property': 'List your property',
        'footer.offer_service': 'Offer a service',
        'footer.offer_experience': 'Offer an experience',
        'footer.new_advertiser_guide': 'Guide for new advertisers',

        'footer.about': 'About Us',
        'footer.about_us': 'About Us',
        'footer.blog_news': 'Blog & News',
        'footer.user_reviews': 'User Reviews',
        'footer.investors_partners': 'Investors & Partners',
        'footer.work_with_us': 'Work with Us',

        'footer.legal': 'Legal',
        'footer.privacy': 'Privacy',
        'footer.terms_conditions': 'Terms & Conditions',
        'footer.cookie_policy': 'Cookie Policy',
        'footer.sitemap': 'Sitemap',
        'footer.company_data': 'Company Data',
        'footer.rights_reserved': 'All rights reserved.',
        
        // Jaime Chat
        'jaime.have_questions': 'Have questions?',
        'jaime.ask_jaime': 'Ask Jaime!',
        
        // Categories
        'category.cabaña': 'Cabin',
        'category.departamento': 'Apartment',
        'category.casa': 'House',
        'category.vehículo': 'Vehicle',
        'category.actividad': 'Activity',
      }
    };
  }

  t(key, params = {}) {
    const translation = this.translations[this.currentLanguage]?.[key] || key;
    
    // Reemplazar parámetros si los hay
    return Object.keys(params).reduce((result, param) => {
      return result.replace(`{${param}}`, params[param]);
    }, translation);
  }

  setLanguage(lang) {
    if (['es', 'en'].includes(lang)) {
      this.currentLanguage = lang;
      localStorage.setItem('preferred_language', lang);
      // Disparar evento para que los componentes se actualicen
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return [
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ];
  }
}

// Instancia global
export const i18n = new I18nManager();

// Hook de React para usar las traducciones
export const useTranslation = () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    const handleLanguageChange = () => forceUpdate();
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  return {
    t: (key, params) => i18n.t(key, params),
    language: i18n.getCurrentLanguage(),
    setLanguage: (lang) => i18n.setLanguage(lang),
    availableLanguages: i18n.getAvailableLanguages()
  };
};