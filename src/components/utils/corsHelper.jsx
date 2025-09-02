// ==== CORS con credenciales ====
const ALLOWED_ORIGINS = new Set([
  "https://arriendospuertovaras.cl",
  "https://www.arriendospuertovaras.cl",
  "https://app.base44.com" // editor/pruebas
]);

function buildCorsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://arriendospuertovaras.cl";
  return {
    "Access-Control-Allow-Origin": allow,          // ¡no usar '*' con credenciales!
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin"
  };
}

export { buildCorsHeaders, ALLOWED_ORIGINS };