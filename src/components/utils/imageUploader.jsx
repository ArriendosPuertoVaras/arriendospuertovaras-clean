import { UploadFile } from "@/api/integrations";
import { Photo } from "@/api/entities";
import { User } from "@/api/entities";

/**
 * Sube una variante de imagen optimizada al almacenamiento
 * @param {string} storageKey - Clave de almacenamiento (path/filename)
 * @param {Blob} blob - Blob de la imagen optimizada
 * @param {Object} opts - Opciones de subida
 * @returns {Promise<string>} - URL pública de la imagen
 */
export async function uploadVariant(storageKey, blob, opts = {}) {
  try {
    // Crear un File object desde el Blob con el nombre correcto
    const filename = storageKey.split('/').pop();
    const file = new File([blob], filename, { 
      type: opts.contentType || blob.type 
    });

    // Usar la integración UploadFile de Base44
    const result = await UploadFile({ file });
    
    // UploadFile retorna { file_url: "..." }
    return result.file_url;
  } catch (error) {
    console.error('Error uploading variant:', error);
    throw new Error(`Failed to upload variant ${storageKey}: ${error.message}`);
  }
}

/**
 * Guarda los metadatos de una foto en la base de datos directamente usando el SDK
 * @param {Object} payload - Datos de la foto
 * @returns {Promise<Object>} - Registro creado en la BD
 */
export async function savePhotoMetadata(payload) {
  try {
    const user = await User.me();
    if (!user?.id) throw new Error("Autenticación requerida para guardar metadatos.");
    
    // Crear el registro en la entidad Photo
    const photoRecord = await Photo.create({
      listing_id: payload.listing_id,
      uploader_id: user.id, // El SDK asegura que el uploader es el usuario logueado
      original_name: payload.original_name,
      mime_original: payload.mime_original,
      width_original: payload.width_original || 0,
      height_original: payload.height_original || 0,
      bytes_original: payload.bytes_original,
      variants: payload.variants,
      labels: payload.labels || {},
      safe_search: payload.safe_search || {},
      room_type: payload.room_type || "other",
      aesthetic_score: payload.aesthetic_score || 0,
      display_order: payload.display_order || 0,
      status: payload.status || "approved"
    });

    return photoRecord;
  } catch (error) {
    console.error('Error saving photo metadata:', error);
    throw new Error(`Failed to save photo metadata: ${error.message}`);
  }
}

/**
 * Obtiene todas las fotos de un listing específico
 * @param {string} listingId - ID del listing
 * @returns {Promise<Array>} - Array de fotos ordenadas
 */
export async function getListingPhotos(listingId) {
  try {
    const photos = await Photo.filter(
      { listing_id: listingId, status: "approved" },
      "display_order"  // Ordenar por display_order ascendente
    );
    return photos;
  } catch (error) {
    console.error('Error getting listing photos:', error);
    throw new Error(`Failed to get photos for listing ${listingId}: ${error.message}`);
  }
}

/**
 * Actualiza el orden de visualización de las fotos
 * @param {Array} photoUpdates - Array de {id, display_order}
 * @returns {Promise<void>}
 */
export async function updatePhotosOrder(photoUpdates) {
  try {
    const updatePromises = photoUpdates.map(update => 
      Photo.update(update.id, { display_order: update.display_order })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating photos order:', error);
    throw new Error(`Failed to update photos order: ${error.message}`);
  }
}

/**
 * Elimina una foto y sus metadatos
 * @param {string} photoId - ID de la foto a eliminar
 * @returns {Promise<void>}
 */
export async function deletePhoto(photoId) {
  try {
    // Nota: Solo elimina los metadatos de la BD.
    // Los archivos en el almacenamiento podrían requerir limpieza adicional
    // dependiendo de las políticas de Supabase Storage
    await Photo.delete(photoId);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw new Error(`Failed to delete photo ${photoId}: ${error.message}`);
  }
}

/**
 * Valida si un archivo es una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {boolean}
 */
export function validateImageFile(file) {
  // Tipos MIME permitidos
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/avif',
    'image/heic'
  ];

  // Verificar tipo MIME
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return false;
  }

  // Verificar tamaño máximo (50MB para archivo original)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return false;
  }

  return true;
}

/**
 * Genera un nombre único para el archivo
 * @param {string} listingId - ID del listing
 * @param {string} originalName - Nombre original del archivo
 * @returns {string} - Nombre único
 */
export function generateUniqueFilename(listingId, originalName) {
  const photoId = crypto.randomUUID();
  const extension = originalName.split('.').pop().toLowerCase();
  const timestamp = Date.now();
  
  return `${listingId}_${photoId}_${timestamp}.${extension}`;
}