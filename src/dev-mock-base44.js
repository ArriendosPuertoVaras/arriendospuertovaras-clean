// src/dev-mock-base44.js
// Desactiva el SDK de Base44 en desarrollo para evitar XHR y parpadeos
if (import.meta.env.DEV) {
  console.warn("[DEV] Mock Base44 activado: se deshabilitan llamadas reales");
  const mock = {
    entities: {},
    auth: { user: null },
    config: {},
    fetch: async () => ({ data: [] }),
    update: async () => {},
  };
  globalThis.Base44Client = mock;
  if (typeof window !== "undefined") window.Base44Client = mock;
}
