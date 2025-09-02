import React from 'react';

const robotsTxtContent = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /Admin
Disallow: /MiCuenta
Disallow: /MyProperties
Disallow: /MyBookings
Disallow: /AddProperty
Disallow: /Dashboard

Sitemap: https://arriendospuertovaras.cl/sitemap
`;

export default function RobotsPage() {
    // This component is intended to be used by a serverless function
    // that sets the Content-Type header to 'text/plain'.
    // In a pure frontend app, we display it for verification.
    return (
        <div style={{ whiteSpace: 'pre', fontFamily: 'monospace', padding: '20px' }}>
            {robotsTxtContent}
        </div>
    );
}