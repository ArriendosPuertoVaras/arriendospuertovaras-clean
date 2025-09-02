
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const LazyImage = ({ 
  src, 
  alt, 
  className,
  blurDataURL,
  width,
  height,
  priority = false,
  sizes = "100vw",
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Helper to check if the URL supports CDN transformations
  const isCdnOptimized = (url) => {
    return url && (url.includes('images.unsplash.com') || url.includes('supabase.co'));
  };

  const generateWebPSource = (src) => {
    if (!src || hasError || !isCdnOptimized(src)) return '';
    
    if (src.includes('images.unsplash.com')) {
      return src + '&fm=webp';
    }
    
    // For Supabase storage, add webp transformation if supported
    if (src.includes('supabase.co')) {
      return src + (src.includes('?') ? '&' : '?') + 'format=webp';
    }
    
    return '';
  };

  const generateAVIFSource = (src) => {
    if (!src || hasError || !isCdnOptimized(src)) return '';
    
    if (src.includes('images.unsplash.com')) {
      return src + '&fm=avif';
    }
    
    return '';
  };

  const generateSrcSet = (baseSrc, format = '') => {
    if (!baseSrc || hasError || !isCdnOptimized(baseSrc)) return '';
    
    const sizes = [400, 800, 1200, 1600];
    const formatParam = format ? `&fm=${format}` : '';
    
    if (baseSrc.includes('images.unsplash.com')) {
      return sizes
        .map(size => `${baseSrc}?w=${size}&q=75${formatParam} ${size}w`)
        .join(', ');
    }
    
    return '';
  };

  const generateBlurDataURL = () => {
    const svg = `
      <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f1f5f9"/>
        <rect width="100%" height="100%" fill="url(#blur)" opacity="0.5"/>
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="20"/>
          </filter>
        </defs>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)} {...props}>
      {/* Blur placeholder */}
      {!isLoaded && !hasError && (
        <img
          src={blurDataURL || generateBlurDataURL()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105"
          aria-hidden="true"
        />
      )}
      
      {/* Main image with modern formats */}
      {isInView && !hasError && (
        <picture>
          {/* AVIF - Best compression */}
          {generateAVIFSource(src) && (
            <source 
              srcSet={generateSrcSet(src, 'avif')} 
              sizes={sizes} 
              type="image/avif" 
            />
          )}
          
          {/* WebP - Good compression, wide support */}
          {generateWebPSource(src) && (
            <source 
              srcSet={generateSrcSet(src, 'webp')} 
              sizes={sizes} 
              type="image/webp" 
            />
          )}
          
          {/* Fallback to original format */}
          <img
            src={src}
            srcSet={isCdnOptimized(src) ? generateSrcSet(src) : undefined}
            sizes={sizes}
            alt={alt || 'Imagen'}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : "auto"}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </picture>
      )}

      {/* Error fallback with proper alt text */}
      {hasError && (
        <div 
          className="absolute inset-0 w-full h-full bg-slate-200 flex items-center justify-center"
          role="img"
          aria-label={alt || 'Imagen no disponible'}
        >
          <div className="text-slate-400 text-center">
            <svg 
              className="w-12 h-12 mx-auto mb-2" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Imagen no disponible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
