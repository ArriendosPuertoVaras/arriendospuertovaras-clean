// src/dev-block-network.js
// Bloquea llamadas a dominios de Base44 SOLO en desarrollo.
if (import.meta.env.DEV && typeof window !== "undefined") {
  const BLOCKED = ["app.base44.com", "base44.app"];
  const shouldBlock = (url) => {
    try { const u = new URL(url, window.location.href); return BLOCKED.includes(u.hostname); }
    catch { return false; }
  };

  const _fetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input?.url || "");
    if (shouldBlock(url)) {
      console.warn("[DEV] Network bloqueada (fetch):", url);
      return new Response(JSON.stringify({ ok: true, devBlocked: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return _fetch(input, init);
  };

  const _open = XMLHttpRequest.prototype.open;
  const _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__dev_url = url;
    return _open.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    const url = this.__dev_url || "";
    if (shouldBlock(url)) {
      console.warn("[DEV] Network bloqueada (XHR):", url);
      this.readyState = 4; this.status = 200;
      this.responseText = JSON.stringify({ ok: true, devBlocked: true });
      if (typeof this.onload === "function") setTimeout(() => this.onload());
      if (typeof this.onreadystatechange === "function") setTimeout(() => this.onreadystatechange());
      return;
    }
    return _send.apply(this, args);
  };
}
