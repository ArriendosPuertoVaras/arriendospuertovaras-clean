
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import { createPageUrl } from "@/utils";
import { HelpArticle } from "@/api/entities";
import { FaqCategory } from "@/api/entities";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HelpArticlePage() {
    const [article, setArticle] = useState(null);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const loadArticle = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const slug = params.get('slug');

                if (!slug) {
                    window.location.href = createPageUrl("HelpCenter");
                    return;
                }
                
                const [allArticles, allCategories] = await Promise.all([
                    HelpArticle.list(),
                    FaqCategory.list()
                ]);

                const currentArticle = allArticles.find(a => a.slug === slug);

                if (currentArticle) {
                    setArticle(currentArticle);
                    const currentCategory = allCategories.find(c => c.slug === currentArticle.category_slug);
                    setCategory(currentCategory);
                }
            } catch (error) {
                console.error("Error loading article:", error);
            }
            setLoading(false);
        };
        loadArticle();
    }, [location.search]);

    if (loading) {
        return <div className="text-center py-20">Cargando artículo...</div>;
    }

    if (!article) {
        return <div className="text-center py-20">Artículo no encontrado.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <div className="flex items-center text-sm text-slate-500">
                    <Link to={createPageUrl("HelpCenter")} className="hover:underline">Centro de Ayuda</Link>
                    {category && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-1" />
                            <Link to={createPageUrl("HelpCategory") + `?slug=${category.slug}`} className="hover:underline">{category.name}</Link>
                        </>
                    )}
                </div>
            </div>

            <article className="prose lg:prose-xl max-w-none">
                <h1>{article.title}</h1>
                <div className="not-prose flex flex-wrap gap-2 mb-8">
                    {article.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
                <ReactMarkdown
                    components={{
                        table: ({node, ...props}) => <table className="w-full border-collapse" {...props} />,
                        th: ({node, ...props}) => <th className="border p-2 bg-slate-100 font-semibold" {...props} />,
                        td: ({node, ...props}) => <td className="border p-2" {...props} />,
                    }}
                >
                    {article.content}
                </ReactMarkdown>
            </article>
        </div>
    );
}
