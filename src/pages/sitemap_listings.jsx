import React from 'react';
import { Property } from '@/api/entities';
import { ProfessionalService } from '@/api/entities';
import { BlogPost } from '@/api/entities';
import { createPageUrl } from '@/utils';

export async function getServerSideProps({ res }) {
    const baseUrl = 'https://arriendospuertovaras.cl';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    try {
        const properties = await Property.filter({ status: 'activa' });
        properties.forEach(item => {
            xml += `
  <url>
    <loc>${baseUrl}${createPageUrl('PropertyDetail')}?id=${item.id}</loc>
    <lastmod>${new Date(item.updated_date || item.created_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
    } catch (e) { console.error("Error fetching properties for sitemap:", e); }

    try {
        const services = await ProfessionalService.filter({ status: 'activo' });
        services.forEach(item => {
            xml += `
  <url>
    <loc>${baseUrl}${createPageUrl('ServiceDetail')}?slug=${item.slug}</loc>
    <lastmod>${new Date(item.updated_date || item.created_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });
    } catch (e) { console.error("Error fetching services for sitemap:", e); }

    try {
        const blogPosts = await BlogPost.filter({ status: 'published' });
        blogPosts.forEach(item => {
            xml += `
  <url>
    <loc>${baseUrl}${createPageUrl('BlogPost')}?slug=${item.slug}</loc>
    <lastmod>${new Date(item.updated_date || item.created_date).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });
    } catch (e) { console.error("Error fetching blog posts for sitemap:", e); }
    
    xml += `
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.write(xml);
    res.end();

    return { props: {} };
}

export default function SitemapListings() { return null; }