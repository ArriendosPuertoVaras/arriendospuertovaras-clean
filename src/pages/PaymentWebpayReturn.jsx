// @ts-nocheck
// deno-lint-ignore-file
// /functions/webpayReturn.ts — recibe token_ws, hace commit y redirige

import { createClientFromRequest } from "npm:@base44/sdk@0.5.0";

const TBK_BASE_URL       = Deno.env.get("TBK_BASE_URL")       || "";
const TBK_COMMERCE_CODE  = Deno.env.get("TBK_COMMERCE_CODE")  || "";
const TBK_API_KEY_SECRET = Deno.env.get("TBK_API_KEY_SECRET") || "";
const TBK_SUCCESS_URL    = Deno.env.get("TBK_SUCCESS_URL")    || "/";
const TBK_FAILURE_URL    = Deno.env.get("TBK_FAILURE_URL")    || "/";

function tbkHeaders() {
  return {
    "Tbk-Api-Key-Id": TBK_COMMERCE_CODE,
    "Tbk-Api-Key-Secret": TBK_API_KEY_SECRET,
    "Content-Type": "application/json",
  };
}

async function readTokenWs(req) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("token_ws");
    if (q) return q;

    if (req.method === "POST") {
      const ct = req.headers.get("content-type") || "";

      if (ct.includes("application/json")) {
        const j = await req.json().catch(() => null);
        return (j && (j.token_ws || j.token)) || null;
      }

      if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
        const f = await req.formData();
        const v = f.get("token_ws");
        return v ? String(v) : null;
      }
    }
  } catch {}
  return null;
}

Deno.serve(async (req) => {
  try {
    const token_ws = await readTokenWs(req);
    if (!token_ws) return Response.redirect(TBK_FAILURE_URL, 302);

    // Commit en Transbank
    const r = await fetch(`${TBK_BASE_URL}/rswebpaytransaction/api/webpay/v1.2/transactions/${token_ws}`, {
      method: "PUT",
      headers: tbkHeaders(),
    });

    let commit = {};
    try { commit = await r.json(); } catch {}
    const ok = r.ok && commit?.status === "AUTHORIZED" && commit?.response_code === 0;

    // Actualizar la booking (no bloquea si falla)
    try {
      const base44 = createClientFromRequest(req);
      const bookingId = String(commit?.buy_order || "");
      if (bookingId) {
        await base44.asServiceRole.entities.Booking.update(bookingId, {
          payment_status: ok ? "pagado" : "fallido",
          status: ok ? "confirmada" : (commit?.status || "rechazada"),
          tbk_authorization_code: commit?.authorization_code ?? null,
          tbk_transaction_date:  commit?.transaction_date  ?? null,
          tbk_amount:            commit?.amount           ?? null,
          tbk_card_detail:       commit?.card_detail ? JSON.stringify(commit.card_detail) : null,
        });
      }
    } catch {}

    return Response.redirect(ok ? TBK_SUCCESS_URL : TBK_FAILURE_URL, 302);
  } catch {
    return Response.redirect(TBK_FAILURE_URL, 302);
  }
});
