
/**
 * Utilidades de seguridad para el sitio web
 */

// Rate limiting storage (in-memory, resets on page reload)
const rateLimitStore = new Map();

/**
 * Verifica si una clave ha excedido el límite de envíos.
 * NOTA: Esto es un rate-limiter del LADO DEL CLIENTE. Es una buena primera barrera,
 * pero el rate-limiting real y efectivo DEBE implementarse en el backend/API.
 * @param {string} key - Clave única para el rate limiting (e.g., 'contact-form-submit')
 * @param {number} maxAttempts - Máximo número de intentos (default: 5)
 * @param {number} windowMs - Ventana de tiempo en milisegundos (default: 10 minutos)
 * @returns {boolean} - true si está dentro del límite, false si ha sido excedido.
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 10 * 60 * 1000) => {
  const now = Date.now();
  const records = (rateLimitStore.get(key) || []).filter(timestamp => now - timestamp < windowMs);

  if (records.length >= maxAttempts) {
    return false; // Exceeded
  }
  
  records.push(now);
  rateLimitStore.set(key, records);
  return true; // OK
};

/**
 * Aplica las cabeceras de seguridad HTTP a través de etiquetas <meta>.
 * Esto se ejecuta en el cliente. La implementación ideal es a nivel de servidor/CDN.
 */
export const applySecurityPolicies = () => {
  const policies = {
    // Content-Security-Policy (CSP): Previene ataques XSS.
    // Agregamos 'unsafe-eval' para permitir React.lazy() y componentes dinámicos
    'Content-Security-Policy': `
      default-src 'self'; 
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; 
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
      img-src 'self' data: https://images.unsplash.com https://qtrypzzcjebvfcihiynt.supabase.co https://*.tile.openstreetmap.org; 
      font-src 'self' https://fonts.gstatic.com; 
      connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://api.openweathermap.org https://base44.app https://*.base44.app wss://base44.app wss://*.base44.app https://app.base44.com wss://app.base44.com https://www.googletagmanager.com;
      frame-src 'self' https://webpay3gint.transbank.cl https://webpay3g.transbank.cl;
      object-src 'none';
      form-action 'self' https://webpay3gint.transbank.cl https://webpay3g.transbank.cl;
      base-uri 'self';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim(),

    // HTTP Strict-Transport-Security (HSTS): Fuerza HTTPS.
    // NOTA: El 'preload' debe usarse con precaución después de confirmar que todo el sitio funciona en HTTPS.
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // X-Content-Type-Options: Previene "MIME sniffing".
    'X-Content-Type-Options': 'nosniff',
    
    // Referrer-Policy: Controla qué información de 'referrer' se envía.
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions-Policy: Controla qué características del navegador puede usar el sitio.
    'Permissions-Policy': `
      geolocation=(), 
      microphone=(), 
      camera=(),
      payment=(),
      usb=(),
      magnetometer=(),
      gyroscope=(),
      accelerometer=()
    `.replace(/\s{2,}/g, ' ').trim()
  };

  Object.entries(policies).forEach(([key, value]) => {
    let meta = document.querySelector(`meta[http-equiv='${key}']`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('http-equiv', key);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', value);
  });
};
if (typeof window !== 'undefined') {
  window.applySecurityPolicies = applySecurityPolicies;
}
