
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from '@/utils';
import { ServiceCategory } from '@/api/entities';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getIconForCategory } from '@/components/utils/iconMap';
import { Info, Loader2 } from 'lucide-react';
import { uniqBy } from 'lodash';

export default function ServicesHub() {
  const [structuredCategories, setStructuredCategories] = useState({});
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAndStructureCategories() {
      try {
        const allCategoriesRaw = await ServiceCategory.filter({ active: true });
        
        const allCategories = uniqBy(allCategoriesRaw, 'slug');

        if (!allCategories || allCategories.length === 0) {
          setStatus("empty");
          setMessage("No hay categorías de servicios definidas.");
          return;
        }

        const parentCategories = allCategories.filter(c => !c.parent_category_slug);
        const childCategories = allCategories.filter(c => c.parent_category_slug);

        const structured = parentCategories.map(parent => ({
          ...parent,
          subcategories: childCategories.filter(child => child.parent_category_slug === parent.slug)
        }));

        const groupedByGroup = {
          home_services: structured.filter(c => c.group === 'home_services'),
          tourism_experiences: structured.filter(c => c.group === 'tourism_experiences'),
          transport_services: structured.filter(c => c.group === 'transport_services'),
          classes_workshops: structured.filter(c => c.group === 'classes_workshops'),
        };

        setStructuredCategories(groupedByGroup);
        setStatus("ok");

      } catch (error) {
        console.error("Error structuring categories:", error);
        setStatus("error");
        setMessage("Hubo un error al cargar las categorías.");
      }
    }
    loadAndStructureCategories();
  }, []);

  const groupTitles = {
    home_services: "Servicios para tu hogar, negocio o propiedad",
    tourism_experiences: "Experiencias y Turismo",
    transport_services: "Arriendo de Vehículos",
    classes_workshops: "Clases y Talleres"
  };

  const renderSection = (key) => {
    const categories = structuredCategories[key];
    if (!categories || categories.length === 0) return null;

    return (
      <section key={key} className="mb-10">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">
          {groupTitles[key]}
        </h2>
        <Accordion type="multiple" className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => {
            const Icon = getIconForCategory(category) || Info;
            return (
              <AccordionItem key={category.slug} value={category.slug} className="border-b-0 w-full">
                <AccordionTrigger className="p-0 hover:no-underline rounded-2xl neumorphic-trigger group">
                   <div className="w-full h-40 text-left p-4 flex flex-col items-center justify-center transition-all duration-300">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mb-3 neumorphic-icon-bg transition-all duration-300 group-hover:scale-105">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 text-center leading-tight">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 text-center font-normal line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                </AccordionTrigger>
                
                <AccordionContent className="pt-2 pb-0 mt-2 neumorphic-content">
                  <div className="space-y-2 p-2">
                      {category.subcategories.map(sub => (
                        <Link 
                          key={sub.slug}
                          to={createPageUrl("ServiceCategoryDetail") + `?slug=${sub.slug}`}
                          className="block p-3 rounded-lg hover:bg-slate-200/50 transition-colors duration-150"
                        >
                          <span className="font-medium text-slate-700 hover:text-blue-600 text-sm">
                            {sub.name}
                          </span>
                        </Link>
                      ))}
                      <Link
                          to={createPageUrl("ServiceCategoryDetail") + `?slug=${category.slug}`}
                          className="block p-3 rounded-lg hover:bg-slate-200/50 transition-colors duration-150 font-semibold text-blue-600 text-sm"
                      >
                          Ver todo en {category.name}
                      </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e0e0e0]">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Cargando categorías...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* La tarjeta (cuadrado) siempre está levantada */
        .neumorphic-trigger {
            background: #e0e0e0;
            box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
            transition: all 0.2s ease-in-out;
            height: 160px; /* Altura fija para todas las tarjetas */
        }
        /* Al pasar el cursor o al estar abierta, la sombra se intensifica */
        .neumorphic-trigger:hover, .neumorphic-trigger[data-state="open"] {
            transform: translateY(-2px);
            box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
        }

        /* El fondo del icono (círculo) siempre está hundido */
        .neumorphic-icon-bg {
            background: #e0e0e0;
            box-shadow: inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff;
            transition: transform 0.2s ease-in-out;
        }
        .neumorphic-trigger:hover .neumorphic-icon-bg {
            transform: scale(1.05);
        }
        
        /* El icono (silueta) cambia de color cuando está activo */
        .neumorphic-icon-bg > svg {
            color: #374151; /* Color gris oscuro por defecto */
            transition: color 0.2s ease-in-out;
        }
        .neumorphic-trigger[data-state="open"] .neumorphic-icon-bg > svg {
             color: #fcc332; /* Color amarillo cuando está activo */
        }
        
        .neumorphic-content {
            background: #e0e0e0;
            border-radius: 1rem;
            box-shadow: inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff;
        }
        
        /* Oculta el cheurón por defecto del acordeón */
        .neumorphic-trigger > .lucide-chevron-down {
            display: none;
        }

        /* Limitar líneas del texto de descripción */
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
      `}</style>
      <div className="bg-[#e0e0e0] min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Un Mundo de Servicios y Experiencias
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Desde soluciones para tu hogar hasta experiencias inolvidables.
              Encuentra u ofrece servicios verificados en Puerto Varas.
            </p>

            {message && (
              <div className={`mt-4 rounded-md border px-4 py-2 text-sm max-w-2xl mx-auto ${
                status === "error" 
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-amber-300 bg-amber-50 text-amber-800"
              }`}>
                {message}
              </div>
            )}
          </header>

          {status === 'ok' && (
            <div className="space-y-6">
              {renderSection('home_services')}
              {renderSection('tourism_experiences')}
              {renderSection('transport_services')}
              {renderSection('classes_workshops')}
            </div>
          )}

          {(status === 'empty' || status === 'error') && (
            <Card className="p-12 text-center neumorphic-outset">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {status === 'error' ? 'Ocurrió un error' : 'No hay categorías disponibles'}
              </h3>
              <p className="text-slate-600">
                {message}
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
