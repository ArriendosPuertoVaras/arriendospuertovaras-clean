import React from 'react';

export default function OptimizedPicture({ 
  photo, 
  alt, 
  className = "",
  loading = "lazy",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw",
  priority = false 
}) {
  if (!photo || !photo.variants) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Sin imagen</span>
      </div>
    );
  }

  const { variants } = photo;
  const fallbackUrl = variants.md?.url || variants.sm?.url || variants.xl?.url || '';

  return (
    <picture>
      {/* AVIF sources para navegadores compatibles */}
      {variants.xxl && variants.xxl.format === 'avif' && (
        <source 
          srcSet={`${variants.xxl.url} ${variants.xxl.w}w`}
          media="(min-width: 1600px)"
          type="image/avif"
        />
      )}
      {variants.xl && variants.xl.format === 'avif' && (
        <source 
          srcSet={`${variants.xl.url} ${variants.xl.w}w`}
          media="(min-width: 1024px)"
          type="image/avif"
        />
      )}
      {variants.md && variants.md.format === 'avif' && (
        <source 
          srcSet={`${variants.md.url} ${variants.md.w}w`}
          media="(min-width: 768px)"
          type="image/avif"
        />
      )}

      {/* WebP sources como fallback */}
      {variants.xxl && variants.xxl.format === 'webp' && (
        <source 
          srcSet={`${variants.xxl.url} ${variants.xxl.w}w`}
          media="(min-width: 1600px)"
          type="image/webp"
        />
      )}
      {variants.xl && variants.xl.format === 'webp' && (
        <source 
          srcSet={`${variants.xl.url} ${variants.xl.w}w`}
          media="(min-width: 1024px)"
          type="image/webp"
        />
      )}
      {variants.md && variants.md.format === 'webp' && (
        <source 
          srcSet={`${variants.md.url} ${variants.md.w}w`}
          media="(min-width: 768px)"
          type="image/webp"
        />
      )}

      {/* Fallback img tag */}
      <img
        src={fallbackUrl}
        alt={alt || 'Imagen'}
        className={className}
        loading={priority ? "eager" : loading}
        decoding="async"
        fetchpriority={priority ? "high" : "auto"}
        sizes={sizes}
        width={variants.md?.w || 1024}
        height={variants.md?.h || 768}
      />
    </picture>
  );
}