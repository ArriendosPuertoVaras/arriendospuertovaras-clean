// src/router.jsx
import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/index.jsx';
import PaymentWebpayReturn from './pages/PaymentWebpayReturn.jsx';

const UseHash = String(import.meta.env.VITE_USE_HASH).toLowerCase() === 'true';
const R = UseHash ? HashRouter : BrowserRouter;

export default function RouterRoot() {
  return (
    <R>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/PaymentWebpayReturn" element={<PaymentWebpayReturn />} />
        <Route path="/payment/webpay/return" element={<PaymentWebpayReturn />} />
        <Route path="/pago/exito" element={<div style={{padding:24}}>✅ Pago recibido</div>} />
        <Route path="/pago/error" element={<div style={{padding:24}}>❌ Pago rechazado</div>} />
        <Route path="*" element={<Home />} />
      </Routes>
    </R>
  );
}
