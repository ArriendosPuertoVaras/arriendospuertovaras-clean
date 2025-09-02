
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FaqCategory } from "@/api/entities";
import { Faq } from "@/api/entities";
import { HelpArticle } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search,
    LifeBuoy,
    ChevronRight,
    Calendar,
    CreditCard,
    BookOpen,
    User,
    PlusSquare,
    Shield
} from "lucide-react";
import { setPageMeta, generateStructuredData, insertStructuredData, setDefaultMeta } from "@/components/utils/seo";

const icons = {
    Calendar: Calendar,
    CreditCard: CreditCard,
    BookOpen: BookOpen,
    User: User,
    PlusSquare: PlusSquare,
    Shield: Shield,
    LifeBuoy: LifeBuoy
};

export default function HelpCenterPage() {
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState({ faqs: [], articles: [] });
    const [loading, setLoading] = useState(true);
    const [allFaqs, setAllFaqs] = useState([]); // New state for all FAQs

    useEffect(() => {
        setDefaultMeta('help-center');

        const loadCategories = async () => {
            try {
                const [fetchedCategories, fetchedFaqs] = await Promise.all([
                    FaqCategory.list(),
                    Faq.list()
                ]);
                
                // Filter out duplicate categories based on the 'slug'
                const uniqueCategories = fetchedCategories.filter((category, index, self) =>
                    index === self.findIndex((c) => c.slug === category.slug)
                );
                setCategories(uniqueCategories);
                setAllFaqs(fetchedFaqs); // Store all fetched FAQs in state

                // Insert FAQPage structured data with all FAQs
                const faqStructuredData = generateStructuredData('faqpage', fetchedFaqs);
                insertStructuredData(faqStructuredData);
                
            } catch (error) {
                console.error("Error loading categories:", error);
            }
            setLoading(false);
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (searchTerm.length < 3) {
                setSearchResults({ faqs: [], articles: [] });
                return;
            }
            try {
                // Fetch articles, but use the already loaded allFaqs from state
                const allArticles = await HelpArticle.list();

                const lowercasedTerm = searchTerm.toLowerCase();
                const filteredFaqs = allFaqs.filter(faq => // Use the allFaqs state
                    faq.question.toLowerCase().includes(lowercasedTerm) ||
                    faq.detailed_answer.toLowerCase().includes(lowercasedTerm)
                );
                const filteredArticles = allArticles.filter(article =>
                    article.title.toLowerCase().includes(lowercasedTerm) ||
                    article.content.toLowerCase().includes(lowercasedTerm)
                );

                setSearchResults({ faqs: filteredFaqs, articles: filteredArticles });
            } catch (error) {
                console.error("Error searching:", error);
            }
        };

        const debounceSearch = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(debounceSearch);
    }, [searchTerm, allFaqs]); // Add allFaqs to dependency array

    const CategoryCard = ({ category }) => {
        const Icon = icons[category.icon] || LifeBuoy;
        return (
            <Link to={createPageUrl("HelpCategory") + `?slug=${category.slug}`}>
                <Card className="card-hover h-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{category.name}</CardTitle>
                        <Icon className="w-6 h-6 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600">{category.description}</p>
                    </CardContent>
                </Card>
            </Link>
        );
    };

    return (
        <div className="bg-slate-50">
            {/* Hero Section */}
            <section className="bg-blue-600 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Centro de Ayuda</h1>
                    <p className="text-xl opacity-90 mb-8">¿Cómo podemos ayudarte hoy?</p>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Busca respuestas (ej. 'cancelar reserva', 'sincronizar calendario')"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-lg p-6 pl-12 text-slate-900"
                        />
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {searchTerm.length < 3 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map(category => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Resultados de búsqueda para "{searchTerm}"</h2>
                        {searchResults.articles.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-4">Artículos</h3>
                                <div className="space-y-3">
                                    {searchResults.articles.map(article => (
                                        <Link key={article.id} to={createPageUrl("HelpArticle") + `?slug=${article.slug}`} className="block p-4 border rounded-lg hover:bg-slate-100">
                                            {article.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {searchResults.faqs.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-4">Preguntas Frecuentes</h3>
                                <div className="space-y-3">
                                    {searchResults.faqs.map(faq => (
                                         <Link key={faq.id} to={createPageUrl("HelpCategory") + `?slug=${faq.category_slug}&faq=${faq.slug}`} className="block p-4 border rounded-lg hover:bg-slate-100">
                                            {faq.question}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {searchResults.articles.length === 0 && searchResults.faqs.length === 0 && (
                            <p>No se encontraron resultados.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
