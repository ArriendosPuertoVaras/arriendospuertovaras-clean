
import React, { useState, useEffect } from "react";
import { Property } from "@/api/entities";
import { BlogPost } from "@/api/entities";
import { ProfessionalService } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Globe, RefreshCw } from "lucide-react";

export default SiteMapGenerator;
  const [sitemap, setSitemap] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    properties: 0,
    services: 0,
    blogPosts: 0,
    staticPages: 0
  });

  const staticPages = [
    { url: "", priority: "1.0", changefreq: "daily" }, // Homepage (root URL)
    { url: "Properties", priority: "0.9", changefreq: "daily" },
    { url: "Services", priority: "0.8", changefreq: "daily" },
    { url: "ServicesHub", priority: "0.8", changefreq: "weekly" },
    { url: "Blog", priority: "0.8", changefreq: "daily" },
    { url: "BecomeHost", priority: "0.7", changefreq: "monthly" },
    { url: "HelpCenter", priority: "0.6", changefreq: "weekly" },
    { url: "TermsAndConditions", priority: "0.5", changefreq: "monthly" },
    { url: "PrivacyPolicy", priority: "0.5", changefreq: "monthly" },
    // Note: Removed /Home from sitemap - only root URL (/) is included
  ];

  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    setLoading(true);
    
    try {
      const baseUrl = window.location.origin;
      let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Add static pages (includes root / but excludes /Home)
      staticPages.forEach(page => {
        const url = page.url ? `${baseUrl}${createPageUrl(page.url)}` : baseUrl + "/"; // Root URL
        sitemapContent += `  <url>\n`;
        sitemapContent += `    <loc>${url}</loc>\n`;
        sitemapContent += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        sitemapContent += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemapContent += `    <priority>${page.priority}</priority>\n`;
        sitemapContent += `  </url>\n`;
      });

      // Add properties
      const properties = await Property.filter({ status: "activa" });
      properties.forEach(property => {
        const url = `${baseUrl}${createPageUrl("PropertyDetail")}?id=${property.id}`;
        sitemapContent += `  <url>\n`;
        sitemapContent += `    <loc>${url}</loc>\n`;
        sitemapContent += `    <lastmod>${new Date(property.updated_date || property.created_date).toISOString().split('T')[0]}</lastmod>\n`;
        sitemapContent += `    <changefreq>weekly</changefreq>\n`;
        sitemapContent += `    <priority>0.8</priority>\n`;
        sitemapContent += `  </url>\n`;
      });

      // Add services
      const services = await ProfessionalService.filter({ status: "activo" });
      services.forEach(service => {
        const url = `${baseUrl}${createPageUrl("ServiceDetail")}?slug=${service.slug}`;
        sitemapContent += `  <url>\n`;
        sitemapContent += `    <loc>${url}</loc>\n`;
        sitemapContent += `    <lastmod>${new Date(service.updated_date || service.created_date).toISOString().split('T')[0]}</lastmod>\n`;
        sitemapContent += `    <changefreq>weekly</changefreq>\n`;
        sitemapContent += `    <priority>0.7</priority>\n`;
        sitemapContent += `  </url>\n`;
      });

      // Add blog posts
      const blogPosts = await BlogPost.filter({ status: "published" });
      blogPosts.forEach(post => {
        const url = `${baseUrl}${createPageUrl("BlogPost")}?slug=${post.slug}`;
        sitemapContent += `  <url>\n`;
        sitemapContent += `    <loc>${url}</loc>\n`;
        sitemapContent += `    <lastmod>${new Date(post.updated_date || post.created_date).toISOString().split('T')[0]}</lastmod>\n`;
        sitemapContent += `    <changefreq>monthly</changefreq>\n`;
        sitemapContent += `    <priority>0.6</priority>\n`;
        sitemapContent += `  </url>\n`;
      });

      sitemapContent += `</urlset>`;

      setSitemap(sitemapContent);
      setStats({
        properties: properties.length,
        services: services.length,
        blogPosts: blogPosts.length,
        staticPages: staticPages.length
      });

    } catch (error) {
      console.error("Error generating sitemap:", error);
    }
    
    setLoading(false);
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemap], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sitemap);
      alert("Sitemap copiado al portapapeles");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Generador de Sitemap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.staticPages}</div>
              <div className="text-sm text-blue-800">Páginas estáticas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.properties}</div>
              <div className="text-sm text-green-800">Propiedades</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.services}</div>
              <div className="text-sm text-purple-800">Servicios</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.blogPosts}</div>
              <div className="text-sm text-orange-800">Artículos</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={generateSitemap} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generando...' : 'Regenerar Sitemap'}
            </Button>
            
            {sitemap && (
              <>
                <Button onClick={downloadSitemap} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar XML
                </Button>
                <Button onClick={copyToClipboard} variant="outline">
                  Copiar al portapapeles
                </Button>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">Instrucciones para Google Search Console</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700">
              <li>Descarga el archivo sitemap.xml generado</li>
              <li>Súbelo a la raíz de tu dominio (https://arriendospuertovaras.cl/sitemap.xml)</li>
              <li>En Google Search Console, ve a "Sitemaps"</li>
              <li>Añade la URL: https://arriendospuertovaras.cl/sitemap.xml</li>
              <li>Haz clic en "Enviar"</li>
            </ol>
          </div>

          {/* Preview */}
          {sitemap && (
            <div>
              <h4 className="font-semibold mb-2">Vista previa del sitemap:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
                {sitemap.substring(0, 2000)}
                {sitemap.length > 2000 && '\n... (contenido truncado)'}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
