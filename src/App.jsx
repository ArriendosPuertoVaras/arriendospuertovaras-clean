import React from 'react';
import RouterRoot from './router.jsx';
export default function App(){ return <RouterRoot/> }
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/index.jsx";
import PaymentWebpayReturn from "./pages/PaymentWebpayReturn.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Retorno Webpay (dos variantes) */}
        <Route path="/PaymentWebpayReturn" element={<PaymentWebpayReturn />} />
        <Route path="/payment/webpay/return" element={<PaymentWebpayReturn />} />
        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
