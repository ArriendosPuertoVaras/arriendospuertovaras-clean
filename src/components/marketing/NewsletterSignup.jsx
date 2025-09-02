import React, { useState } from "react";
import { NewsletterSubscription } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Gift, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSignup({ 
  source = "homepage", 
  variant = "card", 
  title = "¡No te pierdas nada!",
  description = "Recibe las mejores ofertas, propiedades destacadas y guías exclusivas de Puerto Varas." 
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const interestOptions = [
    { id: "propiedades_destacadas", label: "Propiedades destacadas" },
    { id: "servicios_nuevos", label: "Servicios nuevos" },
    { id: "eventos_locales", label: "Eventos locales" },
    { id: "guias_turismo", label: "Guías de turismo" },
    { id: "promociones", label: "Promociones exclusivas" },
    { id: "consejos_anfitriones", label: "Consejos para anfitriones" }
  ];

  const handleInterestChange = (interestId, checked) => {
    if (checked) {
      setInterests(prev => [...prev, interestId]);
    } else {
      setInterests(prev => prev.filter(id => id !== interestId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    setLoading(true);
    try {
      await NewsletterSubscription.create({
        email,
        full_name: fullName,
        interests: interests.length > 0 ? interests : ["propiedades_destacadas", "promociones"],
        source,
        user_type: "guest"
      });

      setSubscribed(true);
      toast.success("¡Te has suscrito exitosamente! Revisa tu email para confirmar.");
    } catch (error) {
      toast.error("Error al suscribirse. Inténtalo de nuevo.");
      console.error("Newsletter subscription error:", error);
    }
    setLoading(false);
  };

  if (subscribed) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">¡Suscripción exitosa!</h3>
          <p className="text-green-700">
            Revisa tu bandeja de entrada para confirmar tu suscripción y recibir tu primer boletín.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formContent = (
    <>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="sr-only">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="fullName" className="sr-only">Nombre</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre (opcional)"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Me interesa recibir información sobre:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interestOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={interests.includes(option.id)}
                  onCheckedChange={(checked) => handleInterestChange(option.id, checked)}
                />
                <Label htmlFor={option.id} className="text-sm font-medium cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full btn-primary" disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Suscribiendo...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Suscribirme
            </>
          )}
        </Button>
      </form>
    </>
  );

  const ctaButton = (
     <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6 max-w-lg mx-auto">{description}</p>
        <Button onClick={() => setIsFormVisible(true)} className="btn-primary px-8 py-3 text-base">
            Suscríbete para recibir ofertas
        </Button>
     </div>
  );

  const content = isFormVisible ? formContent : ctaButton;

  if (variant === "inline") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
        {content}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-8">
        {content}
      </CardContent>
    </Card>
  );
}