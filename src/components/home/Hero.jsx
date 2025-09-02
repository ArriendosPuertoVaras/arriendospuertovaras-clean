import React from 'react';
import LazyImage from '@/components/ui/LazyImage';

/**
 * Hero section component for the homepage
 * Features the main headline and call-to-action
 * @returns {JSX.Element}
 */
export default function Hero() {
  return (
    <section 
      className="relative min-h-[75vh] flex items-start justify-end text-white"
      role="banner"
      aria-labelledby="hero-heading"
    >
      <LazyImage
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/419957f72_hugo-cifuentes-gQ8JpF_n3qg-unsplash_optimized.jpg"
        alt="Vista panorámica del Lago Llanquihue y el Volcán Osorno en Puerto Varas, mostrando la belleza natural de la región de Los Lagos"
        className="absolute inset-0 w-full h-full"
        loading="eager"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 bg-black/30" aria-hidden="true"></div>
      <div className="relative z-10 text-right pt-16 pr-8 lg:pt-24 lg:pr-16">
        <h1 
          id="hero-heading"
          className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow" 
          style={{ color: '#fcc332' }}
        >
          Vive Puerto Varas <br /> como local
        </h1>
        <p className="text-lg md:text-xl max-w-2xl text-shadow-sm">
          Alojamientos únicos, servicios profesionales y experiencias inolvidables en la ciudad de las rosas.
        </p>
      </div>
    </section>
  );
}