
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Property } from "@/api/entities";
import { User } from "@/api/entities";
import { login as authLogin } from "@/components/utils/auth"; // Importar login centralizado
import { PropertyGuide } from "@/api/entities";
import { CancellationPolicy } from "@/api/entities";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
  Home,
  Tag,
  MapPin,
  DollarSign,
  Users,
  Bed,
  Bath,
  List,
  Sparkles,
  Link as LinkIcon,
  Upload,
  Save,
  Info,
  Map as MapIcon,
  ExternalLink,
  X,
  Eye,
  Clock,
  Globe,
  Heart,
  Camera,
  FileText,
  ArrowUp,
  ArrowDown,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AmenitySelector from '@/components/property/AmenitySelector';
import PropertyPreview from '@/components/property/PropertyPreview';
import PropertyGuideForm from '@/components/property/PropertyGuideForm';
import { trackEvent } from '@/components/utils/EventTracker'; // Import GA4 tracker
import BackButton from '@/components/ui/BackButton';

// Set up default icon for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [property, setProperty] = useState({
    title: '',
    category: 'cabaña',
    description: '',
    price_per_night: '',
    location: '',
    address: '',
    latitude: -41.31,
    longitude: -72.98,
    max_guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    structured_amenities: [],
    images: [],
    rules: '',
    check_in_time: '15:00',
    check_out_time: '11:00',
    check_in_start: '14:00',
    check_in_end: '20:00',
    payment_policy: 'immediate',
    languages: ['Español'],
    pet_policy: 'not_allowed',
    pet_conditions: '',
    ical_import_url_booking: '',
    ical_import_url_airbnb: ''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [basicDescription, setBasicDescription] = useState('');
  const [autoGenerateTimeout, setAutoGenerateTimeout] = useState(null);
  const [propertyGuide, setPropertyGuide] = useState(null);
  const [cancellationPolicy, setCancellationPolicy] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const markerRef = useRef(null);
  const [isViewer, setIsViewer] = useState(false); // Added isViewer state

  // Add calendar sync status
  const [calendarSyncStatus, setCalendarSyncStatus] = useState({
    airbnb: 'disconnected', // disconnected, connecting, connected, error
    booking: 'disconnected',
    lastSync: null
  });

  const totalSteps = 4;
  const stepTitles = ["Información Básica", "Detalles y Ubicación", "Fotos y Servicios", "Revisión y Publicación"];

  const autoSaveDraft = useCallback(async () => {
    if (!property.title || loading || isViewer) return; // Prevent auto-save if viewer

    try {
      // Save as draft (simulate)
      setLastSaved(new Date());
      console.log("Auto-saved draft:", new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [property.title, loading, isViewer]);

  const checkAuthAndLoadData = useCallback(async () => {
    try {
      const userData = await User.me(); // REQUIRED AUTH - Esta página necesita login
      setUser(userData);
      setIsViewer(userData.user_type === 'viewer');

      // Only upgrade user type to 'arrendador' if they are neither 'arrendador' nor 'viewer'
      if (userData?.user_type !== 'arrendador' && userData?.user_type !== 'viewer') {
        await User.updateMyUserData({ user_type: 'arrendador' });
        setUser({ ...userData, user_type: 'arrendador' });
      }

      const urlParams = new URLSearchParams(window.location.search);
      const propertyId = urlParams.get('id');

      if (propertyId) {
        setIsEditing(true);
        const allProperties = await Property.list();
        const existingProperty = allProperties.find(prop => prop.id === propertyId);
        if (existingProperty && existingProperty.owner_id === userData.id) {
          setProperty(prev => ({
            ...prev,
            ...existingProperty,
            latitude: existingProperty.latitude || -41.31,
            longitude: existingProperty.longitude || -72.98,
            structured_amenities: existingProperty.structured_amenities || []
          }));

          if (existingProperty.description) {
            setBasicDescription(existingProperty.description.substring(0, 100));
          }

          try {
            const [guides, policies] = await Promise.all([
              PropertyGuide.filter({ property_id: propertyId }),
              CancellationPolicy.filter({ property_id: propertyId })
            ]);

            setPropertyGuide(guides[0] || null);
            setCancellationPolicy(policies[0] || null);
          } catch (error) {
            console.error("Error loading property guide/policy:", error);
          }
        } else {
          toast.error("Propiedad no encontrada o sin permisos para editar.");
          navigate(createPageUrl("MyProperties"));
        }
      }
    } catch (error) {
      // REDIRECT TO LOGIN - This page requires authentication.
      // Usa la función de login centralizada que limpia la URL
      await authLogin();
    }
  }, [navigate]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [checkAuthAndLoadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveDraft();
    }, 30000); // Auto-save every 30 seconds

    return () => {
      clearInterval(interval);
      if (autoGenerateTimeout) clearTimeout(autoGenerateTimeout);
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [autoSaveDraft, autoGenerateTimeout, autoSaveTimer]);

  const handleInputChange = (field, value) => {
    if (isViewer) return; // Prevent input changes if viewer

    // Apply character limit for description
    if (field === 'description' && value.length > 500) {
      return; // Don't update if exceeds limit
    }

    setProperty(prev => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }

    // Trigger auto-save
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    setAutoSaveTimer(setTimeout(autoSaveDraft, 2000));
  };

  const handleAmenitiesChange = (newAmenities) => {
    if (isViewer) return; // Prevent changes if viewer
    setProperty(prev => ({ ...prev, structured_amenities: newAmenities }));
  };

  const handleImageUpload = async (e) => {
    if (isViewer) return; // Prevent upload if viewer
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    toast.info(`Iniciando carga de ${files.length} imagen(es)...`);

    const successfullyUploadedUrls = [];

    for (const file of files) {
        let optimizedFile;
        try {
            toast.info(`Optimizando "${file.name}"...`);
            optimizedFile = await optimizeImage(file);
        } catch (error) {
            console.error(`Error de optimización para ${file.name}:`, error);
            toast.error(`Error al optimizar "${file.name}": ${error.message}`);
            continue; // Saltar al siguiente archivo
        }

        if (optimizedFile.size > 2 * 1024 * 1024) { // 2MB check
            toast.error(`"${file.name}" es demasiado grande (${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB) después de optimizar. Máx 2MB.`);
            continue; // Saltar al siguiente archivo
        }
        
        try {
            toast.info(`Subiendo "${file.name}"...`);
            const result = await UploadFile({ file: optimizedFile });
            if (!result || !result.file_url) {
                throw new Error("La respuesta de la API no incluyó una URL de archivo.");
            }
            successfullyUploadedUrls.push(result.file_url);
            toast.success(`"${file.name}" subida correctamente.`);
        } catch (error) {
            console.error(`Error de subida para ${file.name}:`, error);
            toast.error(`Error al subir "${file.name}": ${error.message}`);
        }
    }
    
    if (successfullyUploadedUrls.length > 0) {
        setProperty(prev => ({ 
            ...prev, 
            images: [...(prev.images || []), ...successfullyUploadedUrls] 
        }));
    }

    setLoading(false);
  };

  const optimizeImage = async (file) => file; // 🔕 sin optimizar

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1200x800, maintain aspect ratio)
        let { width, height } = img;
        const maxWidth = 1200;
        const maxHeight = 800;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            reject(new Error('No se pudo crear el blob de la imagen.'));
          }
        }, 'image/jpeg', 0.85); // 85% quality
      };

      img.onerror = () => {
        reject(new Error('No se pudo cargar el archivo de imagen.'));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const moveImage = (index, direction) => {
    if (isViewer) return; // Prevent changes if viewer
    const newImages = [...property.images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setProperty(prev => ({ ...prev, images: newImages }));
      toast.success("Orden de imágenes actualizado.");
    }
  };

  const handleRemoveImage = (urlToRemove) => {
    if (isViewer) return; // Prevent changes if viewer
    setProperty(prev => ({
      ...prev,
      images: prev.images.filter(url => url !== urlToRemove)
    }));
    toast.success("Imagen eliminada.");
  };

  const handleGenerateDescription = async (descriptionParam = basicDescription) => {
    if (isViewer) return; // Prevent generation if viewer
    if (!descriptionParam.trim() || !property.title.trim()) return;

    setAiLoading(true);

    const prompt = `Eres un experto en marketing inmobiliario para arriendos turísticos en el sur de Chile. Basado en las siguientes características de una propiedad en Puerto Varas: ${descriptionParam}, y con el título "${property.title}", escribe una descripción atractiva, cálida y persuasiva de 150-200 palabras. Destaca los puntos fuertes y crea un llamado a la acción sutil. El tono debe ser profesional pero cercano. No uses emojis. Estructura la respuesta en 2 o 3 párrafos.`;

    try {
      const result = await InvokeLLM({ prompt });
      setProperty(prev => ({ ...prev, description: result }));
      toast.success("Descripción generada exitosamente.");
    } catch (error) {
      toast.error("Error al generar la descripción.");
    }
    setAiLoading(false);
  };

  const validateStep = (step) => {
    const errors = {};

    // No validation needed if in viewer mode, as changes won't be submitted
    if (isViewer) return true;

    switch (step) {
      case 1:
        if (!property.title.trim()) errors.title = "El título es requerido";
        if (!property.category) errors.category = "La categoría es requerida";
        if (!property.description.trim()) errors.description = "La descripción es requerida";
        if (property.description.length > 500) errors.description = "La descripción no puede exceder los 500 caracteres.";
        if (!property.price_per_night || property.price_per_night <= 0) errors.price_per_night = "El precio debe ser mayor a 0";
        break;
      case 2:
        if (!property.location.trim()) errors.location = "La ubicación es requerida";
        if (!property.address.trim()) errors.address = "La dirección es requerida";
        if (!property.max_guests || property.max_guests < 1) errors.max_guests = "Debe permitir al menos 1 huésped";
        break;
      case 3:
        if (!property.images || property.images.length === 0) errors.images = "Debe subir al menos 1 foto";
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (isViewer) { // Allow navigation but don't validate if in viewer mode
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      return;
    }
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const eventHandlers = useMemo(() => ({
    dragend() {
      if (isViewer) return; // Prevent drag if viewer
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        setProperty(prev => ({ ...prev, latitude: lat, longitude: lng }));
        toast.info(`Ubicación actualizada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    },
  }), [isViewer]); // Add isViewer to dependency array

  // Add calendar validation function
  const validateCalendarSync = async (url, platform) => {
    if (isViewer) return; // Prevent sync if viewer
    if (!url) {
      toast.info(`Por favor, introduce una URL de iCal para ${platform === 'airbnb' ? 'Airbnb' : 'Booking'}.`);
      return;
    }

    setCalendarSyncStatus(prev => ({
      ...prev,
      [platform]: 'connecting'
    }));

    try {
      // Simulate calendar validation - in real app, this would test the iCal URL
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCalendarSyncStatus(prev => ({
        ...prev,
        [platform]: 'connected',
        lastSync: new Date()
      }));

      toast.success(`Calendario ${platform === 'airbnb' ? 'Airbnb' : 'Booking'} conectado correctamente.`);
    } catch (error) {
      setCalendarSyncStatus(prev => ({
        ...prev,
        [platform]: 'error'
      }));

      toast.error(`Error al conectar calendario ${platform === 'airbnb' ? 'Airbnb' : 'Booking'}.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewer) { // Do not allow submission if in viewer mode
      toast.info("Estás en modo solo lectura. No se pueden guardar cambios.");
      return;
    }

    if (!validateStep(currentStep)) return;

    // Final validation
    if (!property.images || property.images.length === 0) {
      toast.error("Debe subir al menos 1 foto antes de publicar");
      return;
    }

    setLoading(true);

    const propertyData = {
      ...property,
      price_per_night: parseFloat(property.price_per_night),
      max_guests: parseInt(property.max_guests),
      bedrooms: parseInt(property.bedrooms),
      bathrooms: parseFloat(property.bathrooms),
      latitude: parseFloat(property.latitude),
      longitude: parseFloat(property.longitude),
      owner_id: user.id,
      status: 'pendiente_aprobacion'
    };

    try {
      let propertyId;
      if (isEditing) {
        await Property.update(property.id, propertyData);
        propertyId = property.id;
        toast.success("Propiedad actualizada exitosamente.");
        trackEvent('update_listing', {
          listing_type: 'property',
          listing_id: propertyId
        });
      } else {
        const newProperty = await Property.create(propertyData);
        propertyId = newProperty.id;
        toast.success("Propiedad creada exitosamente. Será revisada por un administrador.");
        trackEvent('publish_listing', {
          listing_type: 'property',
          listing_id: propertyId,
          category: propertyData.category,
          price: propertyData.price_per_night
        });
      }
      navigate(createPageUrl("MyProperties"));
    } catch (error) {
      toast.error("Ocurrió un error al guardar la propiedad.");
      console.error(error);
    }
    setLoading(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título de la Propiedad *</Label>
                    <Input
                      id="title"
                      value={property.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      className={validationErrors.title ? 'border-red-500' : ''}
                      disabled={isViewer} // Disabled for viewer
                    />
                    {validationErrors.title && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={property.category}
                      onValueChange={value => handleInputChange('category', value)}
                      disabled={isViewer} // Disabled for viewer
                    >
                      <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cabaña">Cabaña</SelectItem>
                        <SelectItem value="departamento">Departamento</SelectItem>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="vehículo">Vehículo</SelectItem>
                        <SelectItem value="experiencia">Experiencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Precio por Noche (CLP) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input
                      id="price"
                      type="number"
                      value={property.price_per_night}
                      onChange={e => handleInputChange('price_per_night', e.target.value)}
                      className={`pl-7 ${validationErrors.price_per_night ? 'border-red-500' : ''}`}
                      min="0"
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                  {validationErrors.price_per_night && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.price_per_night}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Description Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span>Descripción Asistida por IA</span>
                  {aiLoading && (
                    <div className="flex items-center space-x-2 text-purple-600">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Generando...</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="basic-description">
                    Características clave (la IA generará automáticamente)
                  </Label>
                  <Textarea
                    id="basic-description"
                    value={basicDescription}
                    onChange={e => {
                      if (isViewer) return; // Prevent changes if viewer
                      setBasicDescription(e.target.value);
                      if (autoGenerateTimeout) clearTimeout(autoGenerateTimeout);
                      if (e.target.value.trim() && property.title.trim()) {
                        setAutoGenerateTimeout(setTimeout(() => {
                          handleGenerateDescription(e.target.value);
                        }, 2000));
                      }
                    }}
                    placeholder="Ej: cabaña de madera, 2 pisos, vista al volcán, a 10 min del centro, quincho, ideal para familias"
                    rows={3}
                    disabled={isViewer} // Disabled for viewer
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción Completa *</Label>
                  <div className="relative">
                    <Textarea
                      id="description"
                      value={property.description}
                      onChange={e => handleInputChange('description', e.target.value)}
                      rows={8}
                      maxLength={500}
                      className={validationErrors.description ? 'border-red-500' : ''}
                      placeholder="La descripción aparecerá aquí automáticamente..."
                      disabled={isViewer}
                    />
                    <div className="absolute bottom-2 right-2 text-sm text-slate-500">
                      <span className={
                        property.description?.length > 480 ? 'text-red-600' :
                        property.description?.length > 450 ? 'text-amber-600' : ''
                      }>
                        {property.description?.length || 0}/500
                      </span>
                    </div>
                  </div>
                  {validationErrors.description && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.description}</p>
                  )}
                  {property.description?.length > 450 && property.description?.length <= 500 && (
                    <p className="text-sm text-amber-600 mt-1">
                      Te quedan {500 - (property.description?.length || 0)} caracteres
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Propiedad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="max_guests">Máx. Huéspedes *</Label>
                    <Input
                      id="max_guests"
                      type="number"
                      value={property.max_guests}
                      onChange={e => handleInputChange('max_guests', e.target.value)}
                      min="1"
                      className={validationErrors.max_guests ? 'border-red-500' : ''}
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                  <div>
                    <Label htmlFor="bedrooms">Habitaciones</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={property.bedrooms}
                      onChange={e => handleInputChange('bedrooms', e.target.value)}
                      min="0"
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Baños</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={property.bathrooms}
                      onChange={e => handleInputChange('bathrooms', e.target.value)}
                      min="0"
                      step="0.5"
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                </div>

                {/* New fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_policy">Política de Pago</Label>
                    <Select
                      value={property.payment_policy}
                      onValueChange={value => handleInputChange('payment_policy', value)}
                      disabled={isViewer} // Disabled for viewer
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Al momento de la reserva</SelectItem>
                        <SelectItem value="checkin">Al check-in</SelectItem>
                        <SelectItem value="partial">50% reserva, 50% check-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="languages">Idiomas disponibles</Label>
                    <Select
                      value={property.languages?.[0] || 'Español'}
                      onValueChange={value => handleInputChange('languages', [value])}
                      disabled={isViewer} // Disabled for viewer
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Español">Español</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Português">Português</SelectItem>
                        <SelectItem value="Français">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pet Policy */}
                <div>
                  <Label className="text-base font-medium">Política de Mascotas</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="not_allowed"
                        checked={property.pet_policy === 'not_allowed'}
                        onChange={e => handleInputChange('pet_policy', e.target.value)}
                        disabled={isViewer} // Disabled for viewer
                      />
                      <span>No se permiten mascotas</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="allowed"
                        checked={property.pet_policy === 'allowed'}
                        onChange={e => handleInputChange('pet_policy', e.target.value)}
                        disabled={isViewer} // Disabled for viewer
                      />
                      <span>Se permiten mascotas</span>
                    </label>
                  </div>
                  {property.pet_policy === 'allowed' && (
                    <Textarea
                      className="mt-2"
                      placeholder="Condiciones para mascotas (ej: máximo 2 perros pequeños, cargo adicional $10.000/noche)"
                      value={property.pet_conditions}
                      onChange={e => handleInputChange('pet_conditions', e.target.value)}
                      disabled={isViewer} // Disabled for viewer
                    />
                  )}
                </div>

                {/* Check-in/out times */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="check_in_start">Check-in desde</Label>
                    <Input
                      id="check_in_start"
                      type="time"
                      value={property.check_in_start}
                      onChange={e => handleInputChange('check_in_start', e.target.value)}
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                  <div>
                    <Label htmlFor="check_in_end">Check-in hasta</Label>
                    <Input
                      id="check_in_end"
                      type="time"
                      value={property.check_in_end}
                      onChange={e => handleInputChange('check_in_end', e.target.value)}
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                  <div>
                    <Label htmlFor="check_in_time">Check-in estándar</Label>
                    <Input
                      id="check_in_time"
                      type="time"
                      value={property.check_in_time}
                      onChange={e => handleInputChange('check_in_time', e.target.value)}
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                  <div>
                    <Label htmlFor="check_out_time">Check-out</Label>
                    <Input
                      id="check_out_time"
                      type="time"
                      value={property.check_out_time}
                      onChange={e => handleInputChange('check_out_time', e.target.value)}
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapIcon className="w-5 h-5" />
                  <span>Ubicación</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Ubicación General *</Label>
                    <Input
                      id="location"
                      value={property.location}
                      onChange={e => handleInputChange('location', e.target.value)}
                      className={validationErrors.location ? 'border-red-500' : ''}
                      placeholder="Ej: Puerto Varas, Frutillar"
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      value={property.address}
                      onChange={e => handleInputChange('address', e.target.value)}
                      className={validationErrors.address ? 'border-red-500' : ''}
                      placeholder="Dirección completa"
                      disabled={isViewer} // Disabled for viewer
                    />
                  </div>
                </div>
                <div>
                  <Label>Ajusta la ubicación exacta en el mapa</Label>
                  <div className="h-96 w-full rounded-lg overflow-hidden z-0 mt-2">
                    <MapContainer
                      center={[property.latitude, property.longitude]}
                      zoom={13}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                      key={`${property.latitude}-${property.longitude}`}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        draggable={!isViewer} // Draggable only if not viewer
                        eventHandlers={eventHandlers}
                        position={[property.latitude, property.longitude]}
                        ref={markerRef}
                      />
                    </MapContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Fotos de la Propiedad</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationErrors.images && (
                  <Alert className="mb-4">
                    <AlertDescription className="text-red-600">
                      {validationErrors.images}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Drag and Drop Image Gallery */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {property.images?.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square group"
                      draggable={!isViewer} // Draggable only if not viewer
                      onDragStart={(e) => { if (!isViewer) e.dataTransfer.setData('text/plain', index.toString()); }}
                      onDragOver={(e) => { if (!isViewer) e.preventDefault(); }}
                      onDrop={(e) => {
                        if (isViewer) return; // Prevent drop if viewer
                        e.preventDefault();
                        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const dropIndex = index;

                        if (dragIndex !== dropIndex) {
                          const newImages = [...property.images];
                          [newImages[dragIndex], newImages[dropIndex]] = [newImages[dropIndex], newImages[dragIndex]];
                          setProperty(prev => ({ ...prev, images: newImages }));
                          toast.success("Orden de imágenes actualizado.");
                        }
                      }}
                    >
                      <img
                        src={url}
                        alt={`Propiedad ${index+1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 bg-blue-600">
                          Portada
                        </Badge>
                      )}

                      {!isViewer && ( // Only show controls if not viewer
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          {index > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 bg-white/90"
                              onClick={() => moveImage(index, 'up')}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                          )}
                          {index < property.images.length - 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 bg-white/90"
                              onClick={() => moveImage(index, 'down')}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRemoveImage(url)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Label htmlFor="image-upload" className={`cursor-pointer ${isViewer ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:bg-slate-50 transition-colors">
                    <Upload className="w-10 h-10 mx-auto text-slate-400 mb-4" />
                    <span className="text-lg text-blue-600 font-medium">Haga clic para subir o arrastre sus imágenes</span>
                    <p className="text-sm text-slate-500 mt-2">
                      JPG/PNG, máx. 2MB c/u, mínimo 1200x800px. Arrastra para reordenar.
                    </p>
                  </div>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isViewer} // Disabled for viewer
                />
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Servicios y Comodidades</CardTitle>
              </CardHeader>
              <CardContent>
                <AmenitySelector
                  value={property.structured_amenities}
                  onChange={handleAmenitiesChange}
                  disabled={isViewer} // Disabled for viewer
                />
                {property.structured_amenities?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {property.structured_amenities.map(amenity => (
                      <Badge key={amenity.id} variant="secondary">
                        {amenity.label} {amenity.included ? '(Incluido)' : (amenity.price ? `($${amenity.price.toLocaleString()})` : '')}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Calendar Sync */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LinkIcon className="w-5 h-5 text-blue-500" />
                  <span>Sincronización de Calendarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    Evita reservas duplicadas. Los calendarios se actualizan cada 15 minutos automáticamente.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ical_airbnb">URL iCal de Airbnb</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="ical_airbnb"
                        value={property.ical_import_url_airbnb}
                        onChange={e => handleInputChange('ical_import_url_airbnb', e.target.value)}
                        placeholder="https://www.airbnb.cl/calendar/ical/..."
                        className="flex-1"
                        disabled={isViewer} // Disabled for viewer
                      />
                      <Button
                        variant="outline"
                        onClick={() => validateCalendarSync(property.ical_import_url_airbnb, 'airbnb')}
                        disabled={!property.ical_import_url_airbnb || calendarSyncStatus.airbnb === 'connecting' || isViewer} // Disabled for viewer
                      >
                        {calendarSyncStatus.airbnb === 'connecting' ? 'Conectando...' : 'Probar'}
                      </Button>
                    </div>
                    {calendarSyncStatus.airbnb === 'connected' && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Conectado correctamente. Última sync: {calendarSyncStatus.lastSync?.toLocaleTimeString()}
                      </p>
                    )}
                    {calendarSyncStatus.airbnb === 'error' && (
                      <p className="text-sm text-red-600 mt-1">
                        ✗ Error de conexión. Verifica la URL.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ical_booking">URL iCal de Booking.com</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="ical_booking"
                        value={property.ical_import_url_booking}
                        onChange={e => handleInputChange('ical_import_url_booking', e.target.value)}
                        placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html?t=..."
                        className="flex-1"
                        disabled={isViewer} // Disabled for viewer
                      />
                      <Button
                        variant="outline"
                        onClick={() => validateCalendarSync(property.ical_import_url_booking, 'booking')}
                        disabled={!property.ical_import_url_booking || calendarSyncStatus.booking === 'connecting' || isViewer} // Disabled for viewer
                      >
                        {calendarSyncStatus.booking === 'connecting' ? 'Conectando...' : 'Probar'}
                      </Button>
                    </div>
                    {calendarSyncStatus.booking === 'connected' && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Conectado correctamente. Última sync: {calendarSyncStatus.lastSync?.toLocaleTimeString()}
                      </p>
                    )}
                    {calendarSyncStatus.booking === 'error' && (
                      <p className="text-sm text-red-600 mt-1">
                        ✗ Error de conexión. Verifica la URL.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Guide */}
            <PropertyGuideForm
              guide={propertyGuide}
              onSave={(guideData) => {
                if (!isViewer) setPropertyGuide(guideData); // Only save if not viewer
              }}
              onCancel={() => {}}
              disabled={isViewer} // Disabled for viewer
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Revisión Final</h3>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>{showPreview ? 'Ocultar' : 'Vista Previa'}</span>
              </Button>
            </div>

            {showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa del Anuncio</CardTitle>
                </CardHeader>
                <CardContent>
                  <PropertyPreview property={property} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Resumen de la Propiedad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Título</Label>
                    <p className="font-semibold">{property.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Precio por noche</Label>
                    <p className="font-semibold text-green-600">${property.price_per_night?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Ubicación</Label>
                    <p>{property.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Capacidad</Label>
                    <p>{property.max_guests} huéspedes, {property.bedrooms} hab, {property.bathrooms} baños</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Fotos subidas</Label>
                    <p className={property.images?.length >= 4 ? 'text-green-600' : 'text-amber-600'}>
                      {property.images?.length || 0} fotos {property.images?.length < 4 && '(Recomendado: mínimo 4)'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Servicios</Label>
                    <p>{property.structured_amenities?.length || 0} servicios configurados</p>
                  </div>
                </div>

                <Separator />

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    Una vez publicada, tu propiedad será revisada por nuestro equipo (24-48h) antes de aparecer en el sitio.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header with back button and title */}
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            {isEditing ? 'Editar Propiedad' : 'Publicar tu Propiedad'}
          </h1>
          <p className="text-xl text-slate-600">
            {isEditing ? 'Actualiza la información de tu propiedad' : 'Comparte tu espacio y comienza a generar ingresos'}
          </p>
        </div>
      </div>

      {/* isViewer Alert */}
      {isViewer && (
        <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-800">Modo Solo Lectura</AlertTitle>
          <AlertDescription className="text-blue-700">
            Estás viendo este formulario como "Viewer". No puedes guardar cambios.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress bar section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
              <span>Paso {currentStep} de {totalSteps}: {stepTitles[currentStep - 1]}</span>
              {lastSaved && (
                <Badge variant="outline" className="text-xs">
                  <Save className="w-3 h-3 mr-1" />
                  Guardado {new Date(lastSaved).toLocaleTimeString()}
                </Badge>
              )}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {renderStepContent()}
      </form>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>

            <div className="text-sm text-slate-500">
              {currentStep} / {totalSteps}
            </div>

            {currentStep === totalSteps ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || isViewer} // Disabled if viewer
                className="btn-primary px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Publicando..." : (isEditing ? "Guardar Cambios" : "Publicar Propiedad")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="btn-primary"
                disabled={isViewer} // Disabled if viewer
              >
                Continuar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
