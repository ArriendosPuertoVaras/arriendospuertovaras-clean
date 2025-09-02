
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import { createPageUrl } from "@/utils";
import { FaqCategory } from "@/api/entities";
import { Faq } from "@/api/entities";
import { HelpArticle } from "@/api/entities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronRight, FileText } from "lucide-react";

export default function HelpCategoryPage() {
    const [category, setCategory] = useState(null);
    const [faqs, setFaqs] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFaq, setActiveFaq] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const loadData = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const slug = params.get('slug');
                const faqSlug = params.get('faq');

                if (!slug) {
                    // Redirect to help center if no slug
                    window.location.href = createPageUrl("HelpCenter");
                    return;
                }
                
                const [allCategories, allFaqs, allArticles] = await Promise.all([
                    FaqCategory.list(),
                    Faq.list(),
                    HelpArticle.list()
                ]);

                const currentCategory = allCategories.find(c => c.slug === slug);
                setCategory(currentCategory);

                const categoryFaqs = allFaqs.filter(f => f.category_slug === slug);
                // Filter out duplicate FAQs based on the 'slug'
                const uniqueFaqs = categoryFaqs.filter((faq, index, self) =>
                    index === self.findIndex((f) => f.slug === faq.slug)
                );
                setFaqs(uniqueFaqs);

                const categoryArticles = allArticles.filter(a => a.category_slug === slug);
                // Filter out duplicate articles based on the 'slug'
                const uniqueArticles = categoryArticles.filter((article, index, self) =>
                    index === self.findIndex((a) => a.slug === article.slug)
                );
                setArticles(uniqueArticles);
                
                if (faqSlug) {
                    setActiveFaq(faqSlug);
                }

            } catch (error) {
                console.error("Error loading category data:", error);
            }
            setLoading(false);
        };
        loadData();
    }, [location.search]);

    if (loading) {
        return <div className="text-center py-20">Cargando...</div>;
    }

    if (!category) {
        return <div className="text-center py-20">Categoría no encontrada.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <div className="flex items-center text-sm text-slate-500">
                    <Link to={createPageUrl("HelpCenter")} className="hover:underline">Centro de Ayuda</Link>
                    <ChevronRight className="w-4 h-4 mx-1" />
                    <span>{category.name}</span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mt-2">{category.name}</h1>
            </div>

            {articles.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6">Artículos de Ayuda</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {articles.map(article => (
                            <Link key={article.id} to={createPageUrl("HelpArticle") + `?slug=${article.slug}`}>
                                <Card className="card-hover h-full">
                                    <CardHeader>
                                        <CardTitle className="flex items-start space-x-3">
                                            <FileText className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                                            <span>{article.title}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 line-clamp-2">{article.seo_summary}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-2xl font-semibold mb-6">Preguntas Frecuentes</h2>
                {faqs.length > 0 ? (
                    <Accordion type="single" collapsible defaultValue={activeFaq} className="w-full">
                        {faqs.map(faq => (
                            <AccordionItem key={faq.slug} value={faq.slug}>
                                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="prose max-w-none text-base p-4">
                                    <ReactMarkdown>
                                        {faq.detailed_answer}
                                    </ReactMarkdown>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p>No hay preguntas frecuentes en esta categoría.</p>
                )}
            </section>
        </div>
    );
}
