
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ServiceCategory } from '@/api/entities';
import { Service } from '@/api/entities';
import { Faq } from '@/api/entities';
import { setPageMeta, generateStructuredData, insertStructuredData } from '@/components/utils/seo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const ServiceCard = ({ service }) => {
    const getPriceDisplay = (service) => {
        switch (service.pricing_model) {
            case 'por_hora': return `$${service.price_per_hour?.toLocaleString()} / hora`;
            case 'por_dia': return `$${service.price_per_day?.toLocaleString()} / día`;
            case 'por_persona': return `$${service.price_per_person?.toLocaleString()} / persona`;
            default: return 'Consultar precio';
        }
    };
    
    return (
        <Card className="neuro-card-outset overflow-hidden h-full flex flex-col">
            <div className="aspect-[4/3] relative overflow-hidden">
                <img
                    src={service.images?.[0] || "https://images.unsplash.com/photo-1521791136064-7986c28e7481?w=400&h=300&fit=crop"}
                    alt={service.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <CardContent className="p-6 flex-grow flex flex-col">
                <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 mb-2">
                    {service.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {service.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-slate-900">
                        {getPriceDisplay(service)}
                    </span>
                    <Button size="sm" className="neuro-button">Ver más <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default function ServiceCategoryDetailPage() {
    const location = useLocation();
    const [category, setCategory] = useState(null);
    const [services, setServices] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getCategorySlug = () => {
            const params = new URLSearchParams(location.search);
            return params.get('slug');
        };

        const slug = getCategorySlug();
        if (!slug) {
            setError("No se especificó una categoría.");
            setLoading(false);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                const [categoryData] = await ServiceCategory.filter({ slug: slug });
                
                if (!categoryData) {
                    throw new Error("Categoría no encontrada.");
                }
                
                setCategory(categoryData);
                setPageMeta(categoryData.seo_title, categoryData.seo_description);

                const [servicesData, faqsData] = await Promise.all([
                    Service.filter({ category: slug, status: "activo" }),
                    Faq.filter({ category_slug: slug })
                ]);
                
                setServices(servicesData);
                setFaqs(faqsData);

                if (faqsData.length > 0) {
                    const faqStructuredData = generateStructuredData('faqpage', faqsData);
                    insertStructuredData(faqStructuredData);
                }

            } catch (err) {
                setError(err.message);
                console.error("Error loading category data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [location.search]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900">Error al cargar la página</h1>
                <p className="text-slate-600 mt-2">{error}</p>
            </div>
        );
    }
    
    const crumbs = [
        { label: 'Servicios', href: '/ServicesHub' },
        { label: category?.name }
    ];

    return (
        <div className="bg-transparent">
            <div className="container mx-auto px-4 py-10 sm:py-16">
                <Breadcrumbs crumbs={crumbs} />
                
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        {category?.h1_text || category?.name}
                    </h1>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                        {category?.intro_text || category?.description}
                    </p>
                </header>

                <main>
                    <section id="services-list" className="mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Proveedores Disponibles</h2>
                        {services.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {services.map(service => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        ) : (
                             <Card className="neuro-card-inset p-12 text-center col-span-full">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                    No hay proveedores disponibles
                                </h3>
                                <p className="text-slate-600">
                                    Aún no hay servicios publicados en esta categoría. ¡Vuelve pronto!
                                </p>
                            </Card>
                        )}
                    </section>

                    {faqs.length > 0 && (
                        <section id="faq" className="neuro-card-outset max-w-3xl mx-auto p-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Preguntas Frecuentes</h2>
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left font-semibold hover:no-underline">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-slate-600">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
