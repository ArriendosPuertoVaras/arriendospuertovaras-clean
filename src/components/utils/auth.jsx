// Utilidades de autenticación centralizadas y optimizadas
import { User } from '@/api/entities'; // SDK oficial

// === Tokens (compat con SDK Base44) ===
const TOKEN_KEY = 'apv_token';
const SDK_TOKEN_KEYS = ['base44_access_token', 'token'];
const ALL_TOKEN_KEYS = [TOKEN_KEY, ...SDK_TOKEN_KEYS];

// Guarda el token en TODAS las llaves (SDK lo verá seguro)
export const setToken = (token) => {
  try {
    if (typeof window === 'undefined') return false;
    ALL_TOKEN_KEYS.forEach(k => localStorage.setItem(k, token));
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

// Lee primero el nuestro; si no, intenta con las llaves del SDK
export const getToken = () => {
  try {
    if (typeof window === 'undefined') return null;

    const own = localStorage.getItem(TOKEN_KEY);
    if (own && own.trim()) return own;

    for (const k of SDK_TOKEN_KEYS) {
      const v = localStorage.getItem(k);
      if (v && v.trim()) return v;
    }
    return null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Limpia TODAS las llaves relacionadas
export const clearToken = () => {
  try {
    if (typeof window === 'undefined') return false;
    ALL_TOKEN_KEYS.forEach(k => localStorage.removeItem(k));
    return true;
  } catch (error) {
    console.error('Error clearing token:', error);
    return false;
  }
};

/**
 * Captura y persiste el access_token si viene en la URL (query ? o hash #)
 * y limpia parámetros sensibles. Retorna true si se capturó algo.
 */
export function captureToken() {
  try {
    if (typeof window === 'undefined') return false;

    const url = new URL(window.location.href);
    const search = url.searchParams;

    // 👇 también parseamos el hash (#access_token=...)
    const rawHash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
    const hash = new URLSearchParams(rawHash);

    const tokenKeys = ['access_token', 'token', 'auth_token'];
    let token = null;

    // Buscar en query primero
    for (const k of tokenKeys) {
      const v = search.get(k);
      if (v) token = v;
    }
    // Si no hay en query, buscar en hash
    if (!token) {
      for (const k of tokenKeys) {
        const v = hash.get(k);
        if (v) token = v;
      }
    }

    let tokenWasCaptured = false;
    if (token && String(token).trim()) {
      if (setToken(String(token).trim())) {
        tokenWasCaptured = true;
        console.log('[auth] Token captured and saved');
      }
    }

    // Limpiar parámetros sensibles en ambos (query + hash)
    const SENSITIVE = [
      'logout','access_token','token','auth_token','id_token',
      'code','state','error','error_description','session_state'
    ];

    let changed = false;

    for (const p of SENSITIVE) {
      if (search.has(p)) { search.delete(p); changed = true; }
      if (hash.has(p))   { hash.delete(p);   changed = true; }
    }

    if (changed) {
      // reconstruir hash limpio (o vacío)
      url.hash = hash.toString() ? '#' + hash.toString() : '';
      // query ya quedó modificada al tocar search
      const clean = url.toString();
      window.history.replaceState({}, '', clean);
      console.log('[auth] URL cleaned of auth params');
    }

    return tokenWasCaptured;
  } catch (error) {
    console.error('Error in captureToken:', error);
    return false;
  }
}

/**
 * ¿Hay "algo" de sesión local? (sólo informativo)
 */
export function isAuthenticated() {
  const token = getToken();
  return !!(token && token.trim());
}

/**
 * Logout
 */
export async function logout() {
  try {
    await User.logout();
    console.log('[auth] API logout successful');
  } catch (error) {
    console.error('[auth] API logout failed (will continue):', error);
  } finally {
    clearToken();

    try {
      const u = new URL(location.href);
      const paramsToClean = [
        'logout','access_token','token','auth_token','id_token',
        'code','state','error','error_description','session_state'
      ];
      paramsToClean.forEach(p => u.searchParams.delete(p));
      history.replaceState({}, '', u.origin + u.pathname + (u.search || '') + u.hash);
    } catch (e) {
      console.error('Error cleaning URL after logout:', e);
    }

    console.log('[auth] Local logout completed');
  }
}

/**
 * Carga el usuario SIEMPRE llamando al SDK (no depende del token local).
 */
export async function loadCurrentUser() {
  try {
    const userData = await User.me();
    // Si llega aquí, estás autenticado (por cookie o token)
    if (userData?.email) {
      console.log('[auth] User data loaded via SDK:', userData.email);
    } else {
      console.log('[auth] User data loaded via SDK');
    }
    return userData;
  } catch (error) {
    console.warn('[auth] User.me() failed. Clearing local token.', error);
    clearToken();
    return null;
  }
}

/**
 * Inicia login (vuelve a la URL actual)
 */
export const login = async () => {
  try {
    console.log('[auth] Initiating login…');
    const currentUrl = window.location.href;
    await User.loginWithRedirect(currentUrl);
  } catch (error) {
    console.error('[auth] Login error:', error);
    throw error;
  }
};

/**
 * Requiere auth: captura token si viene, intenta cargar usuario, o redirige a login
 */
export const requireAuth = async () => {
  try {
    const tokenCaptured = captureToken();
    if (tokenCaptured) console.log('[auth] Token captured from URL');

    const user = await loadCurrentUser();

    if (user) {
      console.log('[auth] User authenticated:', user.email || '(no email)');
      return user;
    } else {
      console.log('[auth] Not authenticated → redirecting to login');
      await login();
      return null;
    }
  } catch (error) {
    console.error('[auth] Error in requireAuth:', error);
    await login();
    return null;
  }
};
