export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS for JSON endpoints
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "no-store",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // HEALTH
    if (path === "/" || path === "/health") {
      return new Response(JSON.stringify({ ok: true, service: "transbank-worker", time: new Date().toISOString() }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // === /webpay/return-callback (echo tokens + optional redirect) ===
    if (path === "/webpay/return-callback") {
      const p = url.searchParams;
      const payload = {
        ok: true,
        received: {
          token_ws: (p.get("token_ws") || "").trim(),
          tbk_token: (p.get("tbk_token") || "").trim(),
          buy_order: (p.get("buy_order") || "").trim(),
          bookingId: (p.get("bookingId") || "").trim(),
          status: (p.get("status") || "").trim(),
        },
        at: new Date().toISOString(),
      };

      // If you want to always show JSON (for evidence):
      if (!env.BASE_URL || (p.get("evidence") === "1")) {
        return new Response(JSON.stringify(payload, null, 2), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }

      // Otherwise redirect to your site with query params
      const redirect = new URL(env.BASE_URL);
      redirect.pathname = "/PaymentWebpayReturn";
      // Prefer Transbank param names; mirror to 'txn' for your UI if needed
      if (payload.received.token_ws) redirect.searchParams.set("txn", payload.received.token_ws);
      if (payload.received.bookingId) redirect.searchParams.set("bookingId", payload.received.bookingId);
      if (payload.received.status) redirect.searchParams.set("status", payload.received.status);
      redirect.searchParams.set("ok", payload.received.token_ws ? "1" : "0");
      return Response.redirect(redirect.toString(), 302);
    }

    // === /receipts/by-transaction (stub) ===
    if (path === "/receipts/by-transaction") {
      let body = {};
      try { body = await request.json(); } catch {}
      const p = url.searchParams;
      const token = (body.token_ws || p.get("token_ws") || "").trim();
      const buyOrder = (body.buy_order || p.get("buy_order") || "").trim();
      if (!token && !buyOrder) {
        return new Response(JSON.stringify({ ok: false, error: "Falta token_ws o buy_order" }), {
          status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      const txn_id = token || `BK-${(buyOrder || "UNKNOWN").slice(0, 8)}`;
      const receipt = {
        txn_id,
        payment_id: txn_id,
        buy_order: buyOrder || `BK-${txn_id.slice(0, 6)}`,
        status: "AUTHORIZED",
        amount: 0,
        currency: "CLP",
        created_at: new Date().toISOString(),
      };
      return new Response(JSON.stringify({ ok: true, receipt }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // 404
    return new Response(JSON.stringify({ ok: false, error: "Not found", path }), {
      status: 404, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}