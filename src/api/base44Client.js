// src/api/base44Client.js
// Un solo "export" válido para ESM, eligiendo mock en DEV y SDK real en PROD.

import { createClient } from '@base44/sdk';

function makeMock() {
  console.warn('[DEV] base44Client: usando MOCK (sin llamadas reales)');
  return {
    entities: {},
    auth: { user: null },
    integrations: { Core: {} },
    functions: new Proxy({}, { get() { return async () => ({ ok: true, devMock: true }); } }),
    update: async () => ({ ok: true, devMock: true }),
    fetch: async () => ({ data: [], devMock: true }),
  };
}

// Si estás en desarrollo (vite dev/preview) => mock.
// En producción (build Vercel) => SDK real.
export const base44 = import.meta.env.DEV
  ? makeMock()
  : createClient({
      // Ajusta si necesitas config:
      // baseUrl: import.meta.env.VITE_BASE44_API_URL,
      // apiKey:  import.meta.env.VITE_BASE44_PUBLIC_KEY,
    });
