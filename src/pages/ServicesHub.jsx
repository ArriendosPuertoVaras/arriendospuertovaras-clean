import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sparkles,
  Wrench,
  Car,
  Utensils,
  TreePine,
  Users
} from "lucide-react";

// 🔒 Toggle temporal mientras no hay backend:
const USE_MOCK = true;

const ICONS = { Sparkles, Wrench, Car, Utensils, TreePine, Users };

// 🔧 Categorías mock (míralas, ajusta textos si quieres)
const MOCK_CATEGORIES = [
  { id: "limpieza", name: "Limpieza y Aseo", icon: "Sparkles", slug: "limpieza",
    description: "Equipos profesionales para turnover y aseo profundo." },
  { id: "mantencion", name: "Mantención", icon: "Wrench", slug: "mantencion",
    description: "Gasfitería, electricidad, pintura y arreglos generales." },
  { id: "transporte", name: "Transporte y Traslados", icon: "Car", slug: "transporte",
    description: "Traslados al aeropuerto, tours y logística local." },
  { id: "gastronomia", name: "Experiencias Gastronómicas", icon: "Utensils", slug: "gastronomia",
    description: "Chefs a domicilio, catas, box gourmet." },
  { id: "jardineria", name: "Jardinería y Paisajismo", icon: "TreePine", slug: "jardineria",
    description: "Corte, poda y mantención de exteriores." },
  { id: "post", name: "Post-arriendo", icon: "Users", slug: "post-arriendo",
    description: "Recepción de huéspedes, entrega de llaves, supervisión." }
];

export default function ServicesHub() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🚫 No llamamos backend por ahora
    if (USE_MOCK) {
      setCategories(MOCK_CATEGORIES);
      setLoading(false);
      return;
    }

    // 🧪 Si quieres, aquí queda el fetch real para más adelante:
    // try {
    //   const rows = await ServiceCategory.filter({ show_on_services: true }, "display_order");
    //   setCategories(rows || []);
    // } catch (e) {
    //   setCategories(MOCK_CATEGORIES); // fallback
    // } finally {
    //   setLoading(false);
    // }
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-center">
        Un Mundo de Servicios y Experiencias
      </h1>
      <p className="text-center text-slate-600 mt-2 max-w-3xl mx-auto">
        Desde soluciones para tu hogar hasta experiencias inolvidables.
        Encuentra u ofrece servicios verificados en Puerto Varas.
      </p>

      {loading ? (
        <div className="mt-10 text-center text-slate-500">Cargando…</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {categories.map((cat) => {
            const Icon = ICONS[cat.icon] || Users;
            return (
              <Link
                key={cat.id}
                to={createPageUrl("ServicesHub") + `?category=${cat.slug}`}
                className="block rounded-xl p-6 bg-white shadow hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div className="font-semibold">{cat.name}</div>
                </div>
                {cat.description && (
                  <p className="text-sm mt-2 text-slate-600">{cat.description}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
