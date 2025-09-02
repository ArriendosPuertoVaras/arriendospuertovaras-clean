import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Car, Wrench, Sparkles } from "lucide-react";

const listingTypes = [
  {
    value: 'property',
    label: 'Propiedad',
    description: 'Cabaña, departamento, casa',
    icon: Home
  },
  {
    value: 'vehicle',
    label: 'Vehículo',
    description: 'Auto, camioneta, motorhome',
    icon: Car
  },
  {
    value: 'service',
    label: 'Servicio',
    description: 'Limpieza, mantención, transporte',
    icon: Wrench
  },
  {
    value: 'experience',
    label: 'Experiencia',
    description: 'Tours, actividades, clases',
    icon: Sparkles
  }
];

export default function StepType({ data, updateData, onNext, onPrev }) {
  const handleTypeChange = (type) => {
    updateData('listing', { type });
  };

  const handleTitleChange = (title) => {
    updateData('listing', { title });
  };

  const canProceed = data.listing.type && data.listing.title;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          ¿Qué quieres publicar?
        </h2>
        <p className="text-slate-600">
          Selecciona el tipo de anuncio que mejor describe lo que ofreces
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {listingTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all ${
                data.listing.type === type.value
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleTypeChange(type.value)}
            >
              <CardContent className="p-6 text-center">
                <Icon className={`w-12 h-12 mx-auto mb-3 ${
                  data.listing.type === type.value ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <h3 className="font-semibold text-lg mb-1">{type.label}</h3>
                <p className="text-sm text-slate-600">{type.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data.listing.type && (
        <div>
          <Label htmlFor="title">Nombre de tu anuncio *</Label>
          <Input
            id="title"
            value={data.listing.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ej. Acogedora cabaña con vista al lago"
            className="mt-2"
          />
          <p className="text-xs text-slate-500 mt-1">
            Usa un título descriptivo y atractivo que destaque lo mejor de tu oferta
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="btn-primary"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}