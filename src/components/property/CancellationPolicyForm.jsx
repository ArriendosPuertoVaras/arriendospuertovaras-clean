import React, { useState } from 'react';
import { CancellationPolicy } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';

const predefinedPolicies = {
  flexible: {
    name: 'Política Flexible',
    description: 'Cancelación gratuita hasta 24 horas antes del check-in',
    details: 'Los huéspedes pueden cancelar hasta 24 horas antes del check-in y recibir un reembolso completo. Cancelaciones realizadas dentro de las 24 horas previas al check-in no serán reembolsadas.',
    refund_percentage_24h: 100,
    refund_percentage_7d: 100,
    refund_percentage_30d: 100
  },
  moderada: {
    name: 'Política Moderada',
    description: 'Cancelación gratuita hasta 7 días antes del check-in',
    details: 'Los huéspedes pueden cancelar hasta 7 días antes del check-in y recibir un reembolso completo. Cancelaciones entre 7 días y 24 horas antes del check-in recibirán un 50% de reembolso. Cancelaciones dentro de las 24 horas previas no serán reembolsadas.',
    refund_percentage_24h: 0,
    refund_percentage_7d: 50,
    refund_percentage_30d: 100
  },
  estricta: {
    name: 'Política Estricta',
    description: 'Sin reembolso una vez confirmada la reserva',
    details: 'Una vez confirmada la reserva, no se otorgan reembolsos por cancelaciones. Esta política aplica independientemente del tiempo de cancelación.',
    refund_percentage_24h: 0,
    refund_percentage_7d: 0,
    refund_percentage_30d: 0
  }
};

export default function CancellationPolicyForm({ propertyId, ownerId, existingPolicy, onSave }) {
  const [policyType, setPolicyType] = useState(existingPolicy?.policy_type || 'flexible');
  const [customPolicy, setCustomPolicy] = useState(existingPolicy?.custom_policy || '');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const generateCustomPolicyWithAI = async () => {
    setAiLoading(true);
    
    try {
      const prompt = `Genera una política de cancelación personalizada y profesional para una propiedad de arriendo turístico en Chile. 

Debe incluir:
- Condiciones de cancelación con diferentes plazos
- Porcentajes de reembolso claros
- Política para no-show
- Excepciones por fuerza mayor
- Lenguaje legal pero comprensible

La política debe ser justa tanto para el huésped como para el anfitrión. Usa un tono profesional pero amigable.`;

      const result = await InvokeLLM({ prompt });
      
      setCustomPolicy(result);
      setPolicyType('personalizada');
      toast.success("Política personalizada generada con IA");
    } catch (error) {
      toast.error("Error al generar política con IA");
    }
    
    setAiLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const selectedPolicy = predefinedPolicies[policyType];
      
      const policyData = {
        property_id: propertyId,
        owner_id: ownerId,
        policy_type: policyType,
        custom_policy: policyType === 'personalizada' ? customPolicy : selectedPolicy?.details,
        refund_percentage_24h: selectedPolicy?.refund_percentage_24h || 0,
        refund_percentage_7d: selectedPolicy?.refund_percentage_7d || 0,
        refund_percentage_30d: selectedPolicy?.refund_percentage_30d || 0,
        no_show_policy: "No se otorgan reembolsos por no presentarse (no-show).",
        ai_generated: policyType === 'personalizada' && customPolicy.length > 0,
        last_updated: new Date().toISOString()
      };

      let savedPolicy;
      if (existingPolicy?.id) {
        savedPolicy = await CancellationPolicy.update(existingPolicy.id, policyData);
      } else {
        savedPolicy = await CancellationPolicy.create(policyData);
      }
      
      toast.success("Política de cancelación guardada");
      if (onSave) onSave(savedPolicy);
    } catch (error) {
      toast.error("Error al guardar la política");
    }
    
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Política de Cancelación</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={policyType} onValueChange={setPolicyType} className="space-y-4">
          {Object.entries(predefinedPolicies).map(([key, policy]) => (
            <div key={key} className="flex items-start space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value={key} id={key} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={key} className="font-semibold cursor-pointer">
                  {policy.name}
                </Label>
                <p className="text-sm text-slate-600 mt-1">{policy.description}</p>
                <p className="text-xs text-slate-500 mt-2">{policy.details}</p>
              </div>
            </div>
          ))}
          
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value="personalizada" id="personalizada" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="personalizada" className="font-semibold cursor-pointer">
                Política Personalizada
              </Label>
              <p className="text-sm text-slate-600 mt-1">Crea tu propia política de cancelación</p>
            </div>
          </div>
        </RadioGroup>

        {policyType === 'personalizada' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="custom-policy">Política Personalizada</Label>
              <Button 
                onClick={generateCustomPolicyWithAI}
                disabled={aiLoading}
                variant="outline"
                size="sm"
                className="text-purple-600 hover:text-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {aiLoading ? "Generando..." : "Generar con IA"}
              </Button>
            </div>
            
            <Textarea
              id="custom-policy"
              value={customPolicy}
              onChange={(e) => setCustomPolicy(e.target.value)}
              placeholder="Escribe tu política de cancelación personalizada aquí..."
              rows={8}
            />
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Vista Previa para Huéspedes:</h4>
          <div className="text-sm text-blue-800">
            {policyType === 'personalizada' ? 
              (customPolicy || "Política personalizada no definida") : 
              predefinedPolicies[policyType]?.details
            }
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Guardando..." : "Guardar Política"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}