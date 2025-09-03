// src/pages/ServicesHub.jsx
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const CATEGORIES = [
  { id: "cleaning", name: "Limpieza y Aseo", go: createPageUrl("Properties") + "?category=cleaning" },
  { id: "maintenance", name: "Mantención", go: createPageUrl("Properties") + "?category=maintenance" },
  { id: "transport", name: "Transporte y Traslados", go: createPageUrl("Properties") + "?category=transport" },
];

export default function ServicesHub() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
          Un Mundo de Servicios y Experiencias
        </h1>
        <p className="text-slate-600 mb-8">
          Desde soluciones para tu hogar hasta experiencias inolvidables.
        </p>

        {/* grid de categorías: cada tarjeta es un Link real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.go}
              className="block rounded-xl bg-white shadow-sm hover:shadow-md transition
                         ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="p-5">
                <div className="text-lg font-semibold text-slate-900">{cat.name}</div>
                <div className="mt-2 text-sm text-slate-500">
                  Ver resultados relacionados en propiedades
                </div>
                <div className="mt-4 inline-flex items-center text-blue-600 font-medium">
                  Explorar →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Acciones adicionales */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to={createPageUrl("Properties")}
            className="px-4 py-2 rounded-lg bg-white ring-1 ring-slate-300 hover:bg-slate-50"
          >
            Ver todas las propiedades
          </Link>
          <Link
            to={createPageUrl("Home")}
            className="px-4 py-2 rounded-lg bg-white ring-1 ring-slate-300 hover:bg-slate-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
