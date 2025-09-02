
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BlogPost } from "@/api/entities";
import {
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  Share2,
  MessageSquare,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LazyImage from "@/components/ui/LazyImage";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BackButton from "@/components/ui/BackButton"; // Added this import
import ReactMarkdown from "react-markdown";
import { setPageMeta, generateStructuredData, insertStructuredData } from "@/components/utils/seo";

export default function BlogPostPage() {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    loadPost();
  }, []);

  const loadPost = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug');

      if (!slug) {
        navigate(createPageUrl("Blog"));
        return;
      }

      const allPosts = await BlogPost.filter({ status: "published" });
      const foundPost = allPosts.find(p => p.slug === slug);

      if (!foundPost) {
        navigate(createPageUrl("Blog"));
        return;
      }

      // Set SEO meta tags
      setPageMeta(
        foundPost.title,
        foundPost.meta_description || foundPost.excerpt,
        window.location.href,
        foundPost.featured_image
      );

      // Insert structured data
      const structuredData = generateStructuredData('blog', foundPost);
      insertStructuredData(structuredData);

      setPost(foundPost);

      // Load related posts (same category, excluding current)
      const related = allPosts
        .filter(p => p.id !== foundPost.id && p.category === foundPost.category)
        .slice(0, 3);
      setRelatedPosts(related);

    } catch (error) {
      console.error("Error loading blog post:", error);
      navigate(createPageUrl("Blog"));
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Artículo no encontrado</h2>
          <Button onClick={() => navigate(createPageUrl("Blog"))}>
            Volver al blog
          </Button>
        </div>
      </div>
    );
  }

  const crumbs = [
    { label: 'Blog', href: createPageUrl('Blog') },
    { label: post.category, href: createPageUrl('Blog') + `?category=${post.category}` },
    { label: post.title }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Start: New back button and breadcrumbs layout */}
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <div className="flex-1">
          <Breadcrumbs crumbs={crumbs} />
        </div>
      </div>
      {/* End: New back button and breadcrumbs layout */}

      {/* Article Header with better SEO structure */}
      <article className="mb-12">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-800">
              {post.category}
            </Badge>
            {post.ai_generated && (
              <Badge variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" aria-hidden="true" />
                Generado por IA
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-slate-600 mb-6 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <time dateTime={post.created_date} className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
                {formatDate(post.created_date)}
              </time>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>{post.reading_time || estimateReadingTime(post.content)} min de lectura</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="focus-outline"
              aria-label="Compartir este artículo"
            >
              <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
              Compartir
            </Button>
          </div>

          {/* Tags with better accessibility */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6" role="list" aria-label="Etiquetas del artículo">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm" role="listitem">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />
        </header>

        {/* Featured Image with better performance */}
        {post.featured_image && (
          <figure className="mb-8">
            <LazyImage
              src={post.featured_image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-xl"
              width={800}
              height={400}
              priority={true}
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </figure>
        )}

        {/* Article Content with better structure */}
        <div className="prose prose-lg max-w-none" role="main">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic my-6 text-slate-600" {...props} />
              ),
              code: ({node, ...props}) => (
                <code className="bg-slate-100 px-1 py-0.5 rounded text-sm" {...props} />
              ),
              pre: ({node, ...props}) => (
                <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Jaime Integration */}
        {post.jaime_integration && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    ¿Tienes más preguntas sobre este tema?
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Jaime, nuestro asistente de IA, puede ayudarte con información personalizada y recomendaciones específicas.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Pregúntale a Jaime
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <aside className="mt-12" role="complementary" aria-label="Artículos relacionados">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Artículos relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost, index) => (
              <article key={relatedPost.id}>
                <Card className="card-hover overflow-hidden">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <LazyImage
                      src={relatedPost.featured_image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      <a 
                        href={createPageUrl("BlogPost") + `?slug=${relatedPost.slug}`}
                        className="hover:text-blue-600 focus-outline rounded"
                      >
                        {relatedPost.title}
                      </a>
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                      <time dateTime={relatedPost.created_date}>
                        {formatDate(relatedPost.created_date)}
                      </time>
                      <span>{relatedPost.reading_time || estimateReadingTime(relatedPost.content)} min</span>
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </aside>
      )}

      {/* Back to Blog with better accessibility */}
      <div className="mt-12 text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate(createPageUrl("Blog"))}
          className="focus-outline"
          aria-label="Volver a la lista de artículos del blog"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Volver al blog
        </Button>
      </div>
    </div>
  );
}
