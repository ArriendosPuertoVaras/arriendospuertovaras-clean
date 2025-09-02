import React from "react";
import ReferralSystem from "@/components/marketing/ReferralSystem";

export default function ReferralProgramPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Programa de Referidos
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Invita a tus amigos y gana dinero. Ellos obtienen descuentos, tú obtienes recompensas.
        </p>
      </div>
      
      <ReferralSystem />
    </div>
  );
}