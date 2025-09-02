// IMPORTANTE: Este archivo ya no inicializa GA4 - eso se hace en Layout.js
// Solo contiene funciones helper para tracking de eventos

/**
 * Track event to GA4 (if gtag is available and consent is granted)
 */
export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

/**
 * Logs a client-side error to the database and GA4.
 * Improved error handling to prevent cascading failures
 */
export const logError = async (error, reactErrorInfo = {}) => {
  try {
    // First, log to console for debugging
    console.error('Application Error:', error, reactErrorInfo);

    // Only try to log to database if we're not in an error loop
    if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      // Don't try to log network errors to avoid loops
      return;
    }

    const { ErrorLog } = await import('@/api/entities');
    const { User } = await import('@/api/entities');
    
    // Try to get user, but don't fail if we can't
    let user = null;
    try {
      user = await User.me();
    } catch (userError) {
      // User not authenticated or other user error, that's fine
    }

    const errorData = {
      error_message: error.message || 'Unknown error',
      stack_trace: error.stack || 'No stack trace available',
      component_info: reactErrorInfo.componentStack || 'N/A',
      url: window.location.href,
      user_agent: navigator.userAgent,
      user_id: user ? user.id : 'anonymous',
      status: 'new'
    };
    
    // 1. Try to save the error to our database with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database logging timeout')), 5000);
    });

    await Promise.race([
      ErrorLog.create(errorData),
      timeoutPromise
    ]);

    // 2. Send an 'exception' event to GA4 (if consent granted)
    trackEvent('exception', {
      description: error.message || 'Unknown error',
      fatal: false, 
    });

  } catch (dbError) {
    // Silently fail database logging to prevent error loops
    console.warn("Could not log error to database:", dbError.message);
  }
};

/**
 * Sets up global error handlers to automatically catch unhandled errors.
 * Improved to prevent error loops
 */
export const setupGlobalErrorHandling = () => {
  if (typeof window !== 'undefined') {
    // Catch uncaught errors
    window.onerror = (message, source, lineno, colno, error) => {
      // Avoid logging CSP errors and other known issues that create loops
      if (message?.includes('Content Security Policy') || 
          message?.includes('unsafe-eval') ||
          message?.includes('Network Error')) {
        return true;
      }

      if (error) {
        logError(error);
      } else {
        const syntheticError = new Error(message);
        syntheticError.stack = `${source} ${lineno}:${colno}`;
        logError(syntheticError);
      }
      return true;
    };

    // Catch unhandled promise rejections
    window.onunhandledrejection = (event) => {
      // Avoid logging network errors that create loops
      if (event.reason?.message?.includes('Network Error') ||
          event.reason?.message?.includes('Failed to fetch')) {
        return;
      }

      const error = event.reason instanceof Error ? event.reason : new Error(JSON.stringify(event.reason));
      logError(error);
    };
  }
};