// Utility to generate favicon files and webmanifest from the base image
// This would typically be run during build process, but can be used for reference

export const generateWebManifest = () => {
  return {
    name: "Arriendos Puerto Varas",
    short_name: "ArriendosPV",
    description: "Plataforma de arriendos, servicios y experiencias en Puerto Varas",
    start_url: "/",
    display: "standalone",
    theme_color: "#0F5E66",
    background_color: "#ffffff",
    icons: [
      {
        src: "/android-chrome-192x192.png?v=apv1",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png?v=apv1",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
};

export const faviconSizes = {
  'favicon.ico': [16, 32, 48], // Multi-size ICO
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512
};

// Instructions for generating favicon files:
// 1. Use the base image: https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3ad262811_favicon_transparent_32x32.png
// 2. Scale to each required size using proper image processing (not browser scaling)
// 3. For ICO file, combine 16x16, 32x32, and 48x48 versions
// 4. For safari-pinned-tab.svg, create a monochrome vector version
// 5. Place all files in the public root directory
// 6. Generate site.webmanifest using the generateWebManifest function above