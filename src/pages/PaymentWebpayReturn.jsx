// src/pages/PaymentWebpayReturn.jsx
import React, { useEffect, useState } from "react";

const CALLBACK_URL  = import.meta.env.VITE_TBK_CALLBACK_URL  || "/api/webpay/return-callback";
const SUCCESS_URL   = import.meta.env.VITE_TBK_SUCCESS_URL   || "/pago/exito";
const FAILURE_URL   = import.meta.env.VITE_TBK_FAILURE_URL   || "/pago/error";
const AUTO_REDIRECT = String(import.meta.env.VITE_TBK_AUTO_REDIRECT || "true").toLowerCase() === "true";

export default function PaymentWebpayReturn() {
  const [status, setStatus] = useState("init"); // init | sending | ok | fail | notoken | backend-missing

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token_ws") || params.get("token");

    if (!token) {
      setStatus("notoken");
      return;
    }

    const go = async () => {
      setStatus("sending");
      try {
        const r = await fetch(CALLBACK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token_ws: token }),
        });

        if (r.ok) {
          setStatus("ok");
          if (AUTO_REDIRECT) setTimeout(() => (window.location.href = SUCCESS_URL), 600);
        } else {
          setStatus("fail");
          if (AUTO_REDIRECT) setTimeout(() => (window.location.href = FAILURE_URL), 900);
        }
      } catch {
        setStatus("backend-missing");
        if (AUTO_REDIRECT) setTimeout(() => (window.location.href = FAILURE_URL), 1200);
      }
    };

    go();
  }, []);

  const goSuccess = () => (window.location.href = SUCCESS_URL);
  const goFailure = () => (window.location.href = FAILURE_URL);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 p-6">
      <div className="w-full max-w-md rounded-2xl border border-border p-6 text-center space-y-3">
        {(status === "init" || status === "sending") && (
          <>
            <h1 className="text-xl font-semibold">Procesando tu pago…</h1>
            <p className="opacity-70">Confirmando con Webpay, por favor espera.</p>
          </>
        )}

        {status === "ok" && (
          <>
            <h1 className="text-xl font-semibold">Pago confirmado 👌</h1>
            <p className="opacity-70">Todo OK.</p>
          </>
        )}

        {status === "fail" && (
          <>
            <h1 className="text-xl font-semibold">Pago rechazado</h1>
            <p className="opacity-70">Puedes reintentar.</p>
          </>
        )}

        {status === "notoken" && (
          <>
            <h1 className="text-xl font-semibold">Falta token</h1>
            <p className="opacity-70">No encontramos <code>token_ws</code> en el enlace.</p>
          </>
        )}

        {status === "backend-missing" && (
          <>
            <h1 className="text-xl font-semibold">Callback no disponible</h1>
            <p className="opacity-70">No pudimos contactar el backend.</p>
          </>
        )}

        {/* Botones manuales cuando AUTO_REDIRECT está apagado (local) */}
        {!AUTO_REDIRECT && (
          <div className="pt-2 flex gap-3 justify-center">
            <button onClick={goSuccess} className="px-4 py-2 rounded-xl border border-border">Ir a éxito</button>
            <button onClick={goFailure} className="px-4 py-2 rounded-xl border border-border">Ir a error</button>
          </div>
        )}
      </div>
    </div>
  );
}
