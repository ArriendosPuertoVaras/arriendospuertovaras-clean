import React from 'react';
import { ServiceCategory } from '@/api/entities';
import { createPageUrl } from '@/utils';

export async function getServerSideProps({ res }) {
    const baseUrl = 'https://arriendospuertovaras.cl';
    const currentDate = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    const staticPages = [
        { url: createPageUrl('Home'), priority: '1.0', changefreq: 'daily' },
        { url: createPageUrl('Properties'), priority: '0.9', changefreq: 'daily' },
        { url: createPageUrl('ServicesHub'), priority: '0.9', changefreq: 'daily' },
        { url: createPageUrl('Blog'), priority: '0.8', changefreq: 'daily' },
        { url: createPageUrl('BecomeHost'), priority: '0.7', changefreq: 'monthly' },
        { url: createPageUrl('Contact'), priority: '0.6', changefreq: 'monthly' },
        { url: createPageUrl('QuienesSomos'), priority: '0.6', changefreq: 'monthly' },
        { url: createPageUrl('Testimonials'), priority: '0.6', changefreq: 'weekly' },
        { url: createPageUrl('HelpCenter'), priority: '0.6', changefreq: 'weekly' }
    ];

    staticPages.forEach(page => {
        xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    try {
        const categories = await ServiceCategory.filter({ active: true });
        categories.forEach(category => {
            const lastmod = new Date(category.updated_date || category.created_date).toISOString().split('T')[0];
            xml += `
  <url>
    <loc>${baseUrl}${createPageUrl('ServiceCategoryDetail')}?slug=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });
    } catch (e) {
        console.error("Error fetching service categories for sitemap:", e);
    }
    
    xml += `
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.write(xml);
    res.end();

    return { props: {} };
}

export default function SitemapPages() { return null; }