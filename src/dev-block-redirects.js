// src/dev-block-redirects.js
// Bloquea redirecciones automáticas SOLO en desarrollo (para evitar parpadeos).
if (import.meta && import.meta.env && import.meta.env.DEV && typeof window !== "undefined") {
  const log = (...a) => console.warn("[DEV] Redirección bloqueada:", ...a);

  // Bloquear asignaciones directas
  Object.defineProperty(window.location, "href", {
    set(url) { log("location.href =", url); },
    get() { return window.location.toString(); }
  });
  window.location.assign  = (url) => log("location.assign(", url, ")");
  window.location.replace = (url) => log("location.replace(", url, ")");

  // Bloquear history push/replace
  const _pushState = history.pushState.bind(history);
  const _replaceState = history.replaceState.bind(history);
  history.pushState = function (...args) { log("history.pushState", ...args); };
  history.replaceState = function (...args) { log("history.replaceState", ...args); };

  // Bloquear meta refresh
  const _appendChild = document.head.appendChild.bind(document.head);
  document.head.appendChild = function (node) {
    try {
      if (node && node.tagName === "META" && (node.httpEquiv || "").toLowerCase() === "refresh") {
        log("meta refresh bloqueado:", node.content);
        return node;
      }
    } catch {}
    return _appendChild(node);
  };
}
