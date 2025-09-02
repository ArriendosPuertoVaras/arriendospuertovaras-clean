import React, { useEffect } from 'react';
import { Property } from '@/api/entities';
import { toast } from 'sonner';

export default function RestorePropertyImages() {
  useEffect(() => {
    const restoreImages = async () => {
      const propertyId = '689be7e4ad96e9d2f06844ac';
      const imagesToAdd = [
        'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a855bc4d7_airbnb-4.jpg',
        'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7782ba678_airbnb-10.jpg',
        'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/42c3ff3b0_airbnb-16.jpg',
        'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b439db6b3_airbnb-29.jpg'
      ];

      try {
        // Get current property
        const properties = await Property.list();
        const property = properties.find(p => p.id === propertyId);
        
        if (!property) {
          toast.error('Propiedad no encontrada');
          return;
        }

        // Add images to existing array or create new array
        const currentImages = property.images || [];
        const updatedImages = [...currentImages, ...imagesToAdd];
        
        // Update property with new images
        await Property.update(propertyId, {
          images: updatedImages
        });
        
        toast.success('Imágenes restauradas exitosamente');
        
      } catch (error) {
        console.error('Error restaurando imágenes:', error);
        toast.error('Error al restaurar las imágenes');
      }
    };

    restoreImages();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Restaurando imágenes...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}