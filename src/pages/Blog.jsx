import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BlogPost } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/ui/LazyImage';
import { setDefaultMeta, generateStructuredData, insertStructuredData } from '@/components/utils/seo';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const blogPosts = await BlogPost.filter({ status: 'published' }, '-created_date');
                setPosts(blogPosts);
            } catch (error) {
                console.error("Error loading blog posts:", error);
            } finally {
                setLoading(false);
            }
        };

        setDefaultMeta('blog');
        loadPosts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-manto">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);

    return (
        <div className="bg-manto min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Blog de Arriendos Puerto Varas
                    </h1>
                    <p className="mt-4 text-xl text-slate-600">
                        Guías, consejos y noticias para disfrutar al máximo tu estadía.
                    </p>
                </header>

                {featuredPost && (
                    <section className="mb-12">
                        <Link to={createPageUrl(`BlogPostDetail?slug=${featuredPost.slug}`)}>
                            <Card className="neuro-card-outset md:flex overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                                <div className="md:w-1/2">
                                    <LazyImage
                                        src={featuredPost.featured_image}
                                        alt={featuredPost.title}
                                        className="w-full h-64 md:h-full object-cover"
                                        priority
                                    />
                                </div>
                                <div className="md:w-1/2 p-6 flex flex-col justify-center">
                                    <Badge className="mb-2 w-fit">{featuredPost.category}</Badge>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-slate-600 mb-4 line-clamp-3">
                                        {featuredPost.excerpt}
                                    </p>
                                    <Button variant="link" className="p-0 h-auto self-start">
                                        Leer más
                                    </Button>
                                </div>
                            </Card>
                        </Link>
                    </section>
                )}

                {otherPosts.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-bold text-slate-900 mb-8">Más artículos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {otherPosts.map((post) => (
                                <Link key={post.id} to={createPageUrl(`BlogPostDetail?slug=${post.slug}`)}>
                                    <Card className="neuro-card-inset h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                                        <LazyImage
                                            src={post.featured_image}
                                            alt={post.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <CardContent className="p-6 flex-grow flex flex-col">
                                            <Badge className="mb-2 w-fit">{post.category}</Badge>
                                            <h3 className="text-xl font-semibold text-slate-900 mb-2 flex-grow">
                                                {post.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                                                {post.excerpt}
                                            </p>
                                            <Button variant="link" className="p-0 h-auto self-start mt-auto">
                                                Leer más
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}