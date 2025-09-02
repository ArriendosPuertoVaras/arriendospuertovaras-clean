import { logError } from './EventTracker';

/**
 * Utilidades para manejo robusto de APIs
 */

/**
 * Realiza una llamada con reintentos automáticos
 * @param {Function} apiCall - Función que retorna una Promise con la llamada a la API
 * @param {Object} options - Opciones de configuración
 * @returns {Promise} - Resultado de la API o error después de todos los reintentos
 */
export const withRetry = async (apiCall, options = {}) => {
  const {
    maxRetries = 2,
    delayMs = 1000,
    backoff = 1.5,
    timeout = 15000,
    signal // Agregamos AbortSignal
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Si la señal fue abortada, salimos del bucle.
    if (signal?.aborted) {
      throw new DOMException('Request aborted by user', 'AbortError');
    }
    
    try {
      // Crear una Promise con timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Request timed out after ${timeout}ms`)), timeout);
      });

      // Ejecutar la llamada con timeout
      const result = await Promise.race([
        apiCall(),
        timeoutPromise
      ]);

      return result;
    } catch (error) {
      lastError = error;
      
      // Log del intento fallido
      console.warn(`API call attempt ${attempt + 1} failed:`, {
        error: error.message,
        type: error.name,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1
      });
      
      // No reintentar en el último intento o si fue un AbortError
      if (attempt === maxRetries || error.name === 'AbortError') {
        break;
      }
      
      // Calcular delay con backoff exponencial
      const delay = delayMs * Math.pow(backoff, attempt);
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Wrapper para llamadas a entidades con manejo robusto de errores
 */
export const safeEntityCall = async (entityCall, fallbackValue = [], options = {}) => {
  try {
    const result = await withRetry(entityCall, {
      maxRetries: 1, // Reducido para ser menos agresivo
      delayMs: 500,
      timeout: 10000,
      ...options
    });
    
    // Verificación básica del tipo de dato esperado
    if (result === null || result === undefined) {
      console.warn('Entity call returned null/undefined, using fallback');
      return fallbackValue;
    }

    // Si esperamos un array pero recibimos otra cosa
    if (Array.isArray(fallbackValue) && !Array.isArray(result)) {
      console.warn(`Expected array but received ${typeof result}, using fallback`);
      return fallbackValue;
    }

    return result;
  } catch (error) {
    // Categorizar tipos de errores
    let errorType = 'unknown';
    let shouldLogError = true;

    if (error.name === 'AbortError') {
      errorType = 'aborted';
      shouldLogError = false; // Los abortos son intencionales
    } else if (error.message?.includes('Network Error')) {
      errorType = 'network';
    } else if (error.message?.includes('timeout')) {
      errorType = 'timeout';
    } else if (error.response?.status >= 400) {
      errorType = 'http_error';
    }

    // Mensaje más descriptivo
    const contextualMessage = getErrorMessage(error, errorType);
    
    if (shouldLogError) {
      console.error('Entity call failed:', {
        error: contextualMessage,
        type: errorType,
        originalError: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n') // Solo las primeras 3 líneas del stack
      });
      
      // Log para monitoreo solo si no es un abort
      logError(error, { 
        context: 'safeEntityCall',
        errorType,
        fallbackUsed: true 
      });
    }

    return fallbackValue;
  }
};

/**
 * Genera mensajes de error más descriptivos
 */
function getErrorMessage(error, errorType) {
  switch (errorType) {
    case 'network':
      return 'Error de conectividad. Verificando conexión a internet...';
    case 'timeout':
      return 'La solicitud tomó demasiado tiempo. Intentando con datos locales...';
    case 'http_error':
      return `Error del servidor (${error.response?.status}). Usando datos de respaldo...`;
    case 'aborted':
      return 'Solicitud cancelada por el usuario';
    default:
      return `Error inesperado: ${error.message}`;
  }
}