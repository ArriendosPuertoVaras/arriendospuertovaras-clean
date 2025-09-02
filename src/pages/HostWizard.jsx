import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { login as authLogin } from "@/components/utils/auth"; // Importar login centralizado
import { Property } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save,
  Check
} from "lucide-react";

// Import step components
import StepProfile from "@/components/host-wizard/StepProfile";
import StepType from "@/components/host-wizard/StepType";
import StepLocation from "@/components/host-wizard/StepLocation";
import StepDetails from "@/components/host-wizard/StepDetails";
import StepCalendar from "@/components/host-wizard/StepCalendar";
import StepPricing from "@/components/host-wizard/StepPricing";
import StepExtras from "@/components/host-wizard/StepExtras";
import StepPhotos from "@/components/host-wizard/StepPhotos";
import StepRules from "@/components/host-wizard/StepRules";
import StepPublish from "@/components/host-wizard/StepPublish";

const TOTAL_STEPS = 10;

const stepTitles = [
  "Perfil de Anfitrión",
  "Tipo de Anuncio",
  "Ubicación",
  "Detalles",
  "Calendario",
  "Precios",
  "Extras",
  "Fotos",
  "Reglas",
  "Publicar"
];

export default function HostWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    hostProfile: {
      name: '',
      email: '',
      phone: '',
      idVerified: false,
      joinLastMinuteDeals: true,
      profileImage: null
    },
    listing: {
      type: '',
      title: '',
      location: {
        address: '',
        city: '',
        region: '',
        lat: -41.31,
        lng: -72.98,
        coverageKm: 0
      },
      details: {},
      calendar: {
        availability: [],
        timeSlots: [],
        ical: {
          importUrls: [],
          exportUrl: ''
        }
      },
      pricing: {
        base: {
          amount: 0,
          currency: 'CLP',
          unit: 'night'
        },
        discounts: [],
        minNights: 1,
        minHours: 1
      },
      extras: [],
      media: {
        photos: [],
        coverId: null,
        videoUrl: ''
      },
      policies: {
        cancellation: 'moderate',
        houseGuide: ''
      },
      payout: {
        provider: '',
        status: 'pending'
      }
    },
    status: 'draft'
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData?.user_type !== 'arrendador') {
        await User.updateMyUserData({ user_type: 'arrendador' });
      }

      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        hostProfile: {
          ...prev.hostProfile,
          name: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        }
      }));

    } catch (error) {
      await authLogin(); // Usa la función de login centralizada
    }
    setLoading(false);
  };

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      // Here we would save to a draft entity or temp storage
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Borrador guardado automáticamente");
    } catch (error) {
      console.error("Error saving draft:", error);
    }
    setSaving(false);
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      saveDraft(); // Auto-save when moving forward
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      // Convert wizard data to Property format
      const propertyData = {
        title: formData.listing.title,
        category: formData.listing.type === 'property' ? 'cabaña' : formData.listing.type,
        description: formData.listing.policies.houseGuide,
        price_per_night: formData.listing.pricing.base.amount,
        location: formData.listing.location.city,
        address: formData.listing.location.address,
        latitude: formData.listing.location.lat,
        longitude: formData.listing.location.lng,
        images: formData.listing.media.photos,
        structured_amenities: formData.listing.extras,
        owner_id: user.id,
        status: 'pendiente_aprobacion',
        ...formData.listing.details
      };

      await Property.create(propertyData);
      toast.success("¡Anuncio publicado exitosamente!");
      navigate(createPageUrl("MyProperties"));
    } catch (error) {
      console.error("Error publishing listing:", error);
      toast.error("Error al publicar el anuncio");
    }
    setSaving(false);
  };

  const renderCurrentStep = () => {
    const commonProps = {
      data: formData,
      updateData: updateFormData,
      onNext: nextStep,
      onPrev: prevStep
    };

    switch (currentStep) {
      case 1: return <StepProfile {...commonProps} />;
      case 2: return <StepType {...commonProps} />;
      case 3: return <StepLocation {...commonProps} />;
      case 4: return <StepDetails {...commonProps} />;
      case 5: return <StepCalendar {...commonProps} />;
      case 6: return <StepPricing {...commonProps} />;
      case 7: return <StepExtras {...commonProps} />;
      case 8: return <StepPhotos {...commonProps} />;
      case 9: return <StepRules {...commonProps} />;
      case 10: return <StepPublish {...commonProps} onPublish={handlePublish} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Crear Anuncio
              </h1>
              <p className="text-slate-600">
                Paso {currentStep} de {TOTAL_STEPS}: {stepTitles[currentStep - 1]}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {saving && (
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Save className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </div>
              )}
              <Badge variant="outline">
                Borrador
              </Badge>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={(currentStep / TOTAL_STEPS) * 100} className="w-full" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8">
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <div className="text-sm text-slate-500">
              {currentStep} / {TOTAL_STEPS}
            </div>

            {currentStep === TOTAL_STEPS ? (
              <Button
                onClick={handlePublish}
                className="btn-primary"
                disabled={saving}
              >
                <Check className="w-4 h-4 mr-2" />
                {saving ? "Publicando..." : "Publicar Anuncio"}
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}