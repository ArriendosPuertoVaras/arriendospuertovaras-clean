/**
 * Feature flags and configuration constants
 * Centralized place for all feature toggles and environment-specific settings
 */

// Environment detection
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));

const isProduction = typeof window !== 'undefined' && 
  window.location.hostname.includes('arriendospuertovaras.cl');

// Feature flags
export const flags = {
  // Data source flags - Temporalmente deshabilitado para evitar errores de red
  USE_MOCK_FEATURED: true, // Cambiado a true temporalmente
  USE_MOCK_SERVICES: true, // Cambiado a true temporalmente
  USE_REAL_ANALYTICS: isProduction, // Use real analytics only in production
  
  // UI feature flags
  ENABLE_ADVANCED_SEARCH: false, // Advanced search filters
  ENABLE_MAP_VIEW: true, // Map view for properties
  ENABLE_DARK_MODE: false, // Dark mode toggle
  ENABLE_PWA_FEATURES: false, // Progressive Web App features
  
  // Marketing flags
  SHOW_NEWSLETTER_POPUP: false, // Newsletter subscription popup
  SHOW_PROMOTIONAL_BANNER: false, // Top promotional banner
  ENABLE_REFERRAL_PROGRAM: false, // Referral program features
  
  // Performance flags
  ENABLE_IMAGE_OPTIMIZATION: true, // Image optimization and lazy loading
  ENABLE_COMPONENT_LAZY_LOADING: true, // Lazy load heavy components
  ENABLE_SERVICE_WORKER: false, // Service worker for caching
  
  // Admin flags
  SHOW_DEBUG_INFO: isDevelopment, // Show debug information
  ENABLE_ADMIN_TOOLS: isDevelopment, // Admin debugging tools
  SHOW_PERFORMANCE_METRICS: isDevelopment, // Performance monitoring
};

// Cache configuration
export const cache = {
  HOMEPAGE_CACHE_TTL_MS: 30 * 60 * 1000, // 30 minutes
  PROPERTIES_CACHE_TTL_MS: 15 * 60 * 1000, // 15 minutes
  SERVICES_CACHE_TTL_MS: 60 * 60 * 1000, // 1 hour
  USER_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
};

// API configuration
export const api = {
  RETRY_ATTEMPTS: 1, // Reducido para evitar múltiples errores
  RETRY_DELAY_MS: 500, // Reducido
  REQUEST_TIMEOUT_MS: 8000, // Reducido
  MAX_CONCURRENT_REQUESTS: 3, // Reducido
};

// UI configuration
export const ui = {
  ITEMS_PER_PAGE: 12,
  FEATURED_PROPERTIES_COUNT: 3,
  HOMEPAGE_SERVICES_COUNT: 8,
  SKELETON_COUNT: 6,
  ANIMATION_DURATION_MS: 200,
  DEBOUNCE_DELAY_MS: 300,
};

// SEO configuration
export const seo = {
  DEFAULT_TITLE_SUFFIX: ' | Arriendos Puerto Varas',
  MAX_TITLE_LENGTH: 60,
  MAX_DESCRIPTION_LENGTH: 155,
  DEFAULT_OG_IMAGE: '/media/og-default.jpg',
  ENABLE_STRUCTURED_DATA: true,
};

// Analytics configuration
export const analytics = {
  GA_MEASUREMENT_ID: 'G-9ZGG23T6WF',
  ENABLE_CUSTOM_EVENTS: true,
  ENABLE_ECOMMERCE_TRACKING: true,
  ENABLE_USER_TIMING: isDevelopment,
  SAMPLE_RATE: isProduction ? 100 : 10, // 100% in prod, 10% in dev
};

// Image configuration
export const images = {
  PLACEHOLDER_URL: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
  LAZY_LOADING_THRESHOLD: '50px', // Intersection Observer root margin
  QUALITY: 75, // Image quality for optimization
  FORMATS: ['webp', 'jpg'], // Preferred image formats
};

// Validation helpers
export const getFlag = (flagName, defaultValue = false) => {
  return flags[flagName] !== undefined ? flags[flagName] : defaultValue;
};

export const getConfig = (section, key, defaultValue = null) => {
  const configs = { cache, api, ui, seo, analytics, images };
  const sectionConfig = configs[section];
  return sectionConfig && sectionConfig[key] !== undefined ? sectionConfig[key] : defaultValue;
};

// Environment helpers
export const isFeatureEnabled = (featureName) => {
  return getFlag(featureName, false);
};

export const isDev = () => isDevelopment;
export const isProd = () => isProduction;

export default {
  flags,
  cache,
  api,
  ui,
  seo,
  analytics,
  images,
  getFlag,
  getConfig,
  isFeatureEnabled,
  isDev,
  isProd,
};