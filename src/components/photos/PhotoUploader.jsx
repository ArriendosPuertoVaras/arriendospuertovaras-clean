import React, { useState, useEffect, useCallback, useRef } from "react";
import { buildVariants } from "@/components/utils/imageOptimizer";
import { uploadVariant, savePhotoMetadata, getListingPhotos, updatePhotosOrder, deletePhoto, validateImageFile } from "@/components/utils/imageUploader";
import { toast } from "sonner";
import { Upload, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";

export default function PhotoUploader({ listingId, maxPhotos = 8, onUploadComplete }) {
  const [photos, setPhotos] = useState([]);
  const [queue, setQueue] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedPhotos = await getListingPhotos(listingId);
      setPhotos(fetchedPhotos);
    } catch (err) {
      setError("No se pudieron cargar las fotos existentes.");
      toast.error("Error al cargar fotos.");
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(validateImageFile);
    
    if (selectedFiles.length > validFiles.length) {
      toast.warning(`Algunos archivos fueron ignorados por formato o tamaño.`);
    }

    const availableSlots = maxPhotos - (photos.length + queue.length);
    if (validFiles.length > availableSlots) {
      toast.error(`Solo puedes añadir ${availableSlots} foto(s) más.`);
    }

    setQueue(prev => [...prev, ...validFiles.slice(0, availableSlots)]);
    e.target.value = null;
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect({ target: { files: e.dataTransfer.files } });
  };

  const handleRemoveFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (queue.length === 0) return;
    
    setIsUploading(true);
    setProgress(0);
    const totalUploads = queue.length;
    let completedUploads = 0;

    for (const file of queue) {
      try {
        toast.info(`Procesando ${file.name}...`);
        const variants = await buildVariants(file);
        const photoId = crypto.randomUUID();
        const variantPayload = {};
        
        let subProgress = 0;
        const totalSubSteps = Object.keys(variants).length;

        for (const [key, { blob, w, h, ext }] of Object.entries(variants)) {
          const storageKey = `photos/${listingId}/${photoId}/${key}.${ext}`;
          const url = await uploadVariant(storageKey, blob, { contentType: `image/${ext}` });
          variantPayload[key] = { url, w, h, bytes: blob.size, format: ext };
          subProgress++;
          const currentFileProgress = (subProgress / totalSubSteps) * (100 / totalUploads);
          setProgress(prev => prev + currentFileProgress / totalUploads);
        }
        
        const img = await new Promise(res => { const i=new Image(); i.onload=()=>res(i); i.src=URL.createObjectURL(file); });

        await savePhotoMetadata({
          listing_id: listingId,
          original_name: file.name,
          mime_original: file.type,
          bytes_original: file.size,
          width_original: img.width,
          height_original: img.height,
          variants: variantPayload,
          display_order: photos.length + completedUploads,
        });
        
        completedUploads++;
        setProgress((completedUploads / totalUploads) * 100);

      } catch (err) {
        console.error("Error subiendo una imagen:", err);
        toast.error(`Error con ${file.name}.`);
        setIsUploading(false);
        return;
      }
    }

    toast.success(`${queue.length} imagen(es) subida(s) correctamente.`);
    setQueue([]);
    setIsUploading(false);
    fetchPhotos(); // Refrescar la lista de fotos
    if (onUploadComplete) onUploadComplete();
  };

  const handleReorder = async (fromIndex, toIndex) => {
    const newPhotos = [...photos];
    const [movedItem] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedItem);
    
    setPhotos(newPhotos); // Optimistic update

    const updates = newPhotos.map((photo, index) => ({ id: photo.id, display_order: index }));

    try {
      await updatePhotosOrder(updates);
      toast.success("Orden de fotos actualizado.");
    } catch (err) {
      toast.error("Error al actualizar el orden.");
      setPhotos(photos); // Revert on error
    }
  };
  
  const handleDelete = async (photoId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta foto?")) return;
    
    const originalPhotos = [...photos];
    setPhotos(prev => prev.filter(p => p.id !== photoId));

    try {
      await deletePhoto(photoId);
      const remainingPhotos = originalPhotos.filter(p => p.id !== photoId);
      const updates = remainingPhotos.map((photo, i) => ({ id: photo.id, display_order: i }));
      if (updates.length > 0) await updatePhotosOrder(updates);
      toast.success("Foto eliminada.");
    } catch (err) {
      toast.error("Error al eliminar la foto.");
      setPhotos(originalPhotos);
    }
  };
  
  const dragItem = useRef();
  const dragOverItem = useRef();

  const handleDragStart = (e, position) => { dragItem.current = position; };
  const handleDragEnter = (e, position) => { dragOverItem.current = position; };
  const handleDragEnd = () => handleReorder(dragItem.current, dragOverItem.current);

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive">{error}</Alert>}
      
      {!isUploading && (photos.length + queue.length < maxPhotos) && (
        <div 
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input-photo-uploader').click()}
        >
          <input 
            id="file-input-photo-uploader"
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileSelect}
            className="hidden" 
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Arrastra y suelta o <span className="font-semibold text-blue-600">haz clic para seleccionar</span>.
          </p>
          <p className="text-xs text-gray-500 mt-1">Máx {maxPhotos} fotos.</p>
        </div>
      )}

      {queue.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Imágenes en cola</h3>
          {queue.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center space-x-2 p-2 border rounded-md">
              <img src={URL.createObjectURL(file)} alt={file.name} className="w-10 h-10 rounded object-cover" />
              <div className="flex-1 text-sm truncate">{file.name}</div>
              <Button size="icon" variant="ghost" onClick={() => handleRemoveFromQueue(index)} disabled={isUploading}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleUpload} disabled={isUploading || queue.length === 0} className="w-full">
            {isUploading ? 'Subiendo...' : `Subir ${queue.length} imagen(es)`}
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-slate-500 text-center">{Math.round(progress)}%</p>
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="font-semibold">Fotos subidas</h3>
        {isLoading ? <p>Cargando...</p> : photos.length === 0 && <p className="text-sm text-slate-500">No hay fotos.</p>}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="relative group aspect-square"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <img 
                src={photo.variants?.md?.url || ""} 
                alt={`Foto ${index + 1}`} 
                className="w-full h-full object-cover rounded-lg bg-slate-100" 
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                <div className="absolute top-1 right-1">
                   <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => handleDelete(photo.id)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <GripVertical className="text-white cursor-move"/>
              </div>
               {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Portada
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}