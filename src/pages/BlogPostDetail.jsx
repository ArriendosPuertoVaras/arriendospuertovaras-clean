import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BlogPost } from '@/api/entities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/ui/LazyImage';
import ReactMarkdown from 'react-markdown';
import { setPageMeta, generateStructuredData, insertStructuredData } from '@/components/utils/seo';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function BlogPostDetailPage() {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const loadPost = async () => {
            const params = new URLSearchParams(location.search);
            const slug = params.get('slug');

            if (!slug) {
                setLoading(false);
                return;
            }

            try {
                const results = await BlogPost.filter({ slug: slug, status: 'published' });
                if (results.length > 0) {
                    const loadedPost = results[0];
                    setPost(loadedPost);
                    
                    // SEO
                    setPageMeta(
                        loadedPost.title,
                        loadedPost.meta_description || loadedPost.excerpt,
                        window.location.href,
                        loadedPost.featured_image
                    );

                    const structuredData = generateStructuredData('blog', loadedPost);
                    insertStructuredData(structuredData);

                }
            } catch (error) {
                console.error("Error loading blog post:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [location.search]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-manto">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center">
                <div>
                    <h1 className="text-2xl font-bold">Artículo no encontrado</h1>
                    <Link to={createPageUrl('Blog')} className="text-blue-600 hover:underline mt-4 inline-block">
                        Volver al Blog
                    </Link>
                </div>
            </div>
        );
    }

    const breadcrumbs = [
        { label: 'Blog', href: createPageUrl('Blog') },
        { label: post.title }
    ];

    return (
        <div className="bg-manto py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Breadcrumbs crumbs={breadcrumbs} />
                </div>
                <Card className="neuro-card-inset overflow-hidden">
                    <LazyImage
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-96 object-cover"
                        priority
                    />
                    <div className="p-6 md:p-10">
                        <div className="mb-6">
                            <Badge className="mr-2">{post.category}</Badge>
                            {post.tags?.map(tag => (
                                <Badge key={tag} variant="secondary" className="mr-2">{tag}</Badge>
                            ))}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            {post.title}
                        </h1>
                        <p className="text-lg text-slate-600 mb-8">
                            {post.excerpt}
                        </p>
                        <article className="prose prose-lg max-w-none prose-slate">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </article>
                    </div>
                </Card>
            </div>
        </div>
    );
}