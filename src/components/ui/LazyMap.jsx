import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LazyMap = ({ latitude, longitude, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const loadMap = async () => {
    if (isLoaded) return;
    
    try {
      // Dynamic import to split bundle
      const { MapContainer, TileLayer, Marker } = await import('react-leaflet');
      const L = await import('leaflet');
      
      // Set up Leaflet icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading map:', error);
    }
  };

  const MapComponent = React.lazy(() => import('react-leaflet').then(module => ({ 
    default: () => {
      const { MapContainer, TileLayer, Marker } = module;
      return (
        <MapContainer 
          center={[latitude, longitude]} 
          zoom={13} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} />
        </MapContainer>
      );
    }
  })));

  return (
    <div ref={containerRef} className={className}>
      {!isInView ? (
        <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Mapa se cargará al hacer scroll</p>
          </div>
        </div>
      ) : !isLoaded ? (
        <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
          <Button onClick={loadMap} variant="outline">
            <MapPin className="w-4 h-4 mr-2" />
            Cargar Mapa
          </Button>
        </div>
      ) : (
        <React.Suspense fallback={
          <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <MapComponent />
        </React.Suspense>
      )}
    </div>
  );
};

export default LazyMap;