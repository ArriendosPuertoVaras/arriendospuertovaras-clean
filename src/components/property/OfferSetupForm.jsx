import React, { useState } from 'react';
import { LastMinuteOffer } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const availableBenefits = [
    { id: 'leña', label: 'Leña para calefacción' },
    { id: 'desayuno', label: 'Desayuno incluido' },
    { id: 'limpieza_diaria', label: 'Servicio de limpieza diaria' },
    { id: 'transporte', label: 'Transporte/Transfer' },
];

export default function OfferSetupForm({ properties, onSave, onCancel, ownerId }) {
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [activationWindow, setActivationWindow] = useState('24');
    const [discountType, setDiscountType] = useState('fijo');
    const [discountPercentage, setDiscountPercentage] = useState(20);
    const [removedBenefits, setRemovedBenefits] = useState([]);
    const [loading, setLoading] = useState(false);

    const selectedProperty = properties.find(p => p.id === selectedPropertyId);
    const offerPrice = selectedProperty 
        ? Math.round(selectedProperty.price_per_night * (1 - discountPercentage / 100))
        : 0;

    const handleBenefitChange = (benefitId, checked) => {
        setRemovedBenefits(prev => 
            checked ? [...prev, benefitId] : prev.filter(id => id !== benefitId)
        );
    };

    const handleSubmit = async () => {
        if (!selectedPropertyId) {
            toast.error('Por favor, selecciona una propiedad.');
            return;
        }
        setLoading(true);
        try {
            await LastMinuteOffer.create({
                property_id: selectedPropertyId,
                owner_id: ownerId,
                activation_window_hours: parseInt(activationWindow),
                discount_type: discountType,
                discount_percentage: discountPercentage,
                removed_benefits: removedBenefits,
                original_price: selectedProperty.price_per_night,
                offer_price: offerPrice,
                status: 'configurada',
                // expires_at will be set by a backend process when the offer becomes active
            });
            onSave();
        } catch (error) {
            toast.error('Error al guardar la oferta.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-slate-50 border-dashed">
            <CardHeader>
                <CardTitle>Configurar Nueva Oferta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Propiedad</Label>
                    <Select onValueChange={setSelectedPropertyId} value={selectedPropertyId}>
                        <SelectTrigger><SelectValue placeholder="Selecciona una propiedad..." /></SelectTrigger>
                        <SelectContent>
                            {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Activar oferta</Label>
                        <Select onValueChange={setActivationWindow} value={activationWindow}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24">24h antes del check-in</SelectItem>
                                <SelectItem value="48">48h antes del check-in</SelectItem>
                                <SelectItem value="72">72h antes del check-in</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Tipo de Descuento</Label>
                        <Select onValueChange={setDiscountType} value={discountType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fijo">Fijo (%)</SelectItem>
                                <SelectItem value="dinamico_ia" disabled><Sparkles className="w-4 h-4 inline-block mr-2"/>Dinámico con IA (Próximamente)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                {discountType === 'fijo' && (
                    <div className="space-y-2">
                        <Label>Porcentaje de Descuento</Label>
                        <Input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(parseInt(e.target.value))} min="5" max="80" />
                    </div>
                )}

                <div className="space-y-3">
                    <Label>Eliminar beneficios para reducir el precio</Label>
                    {availableBenefits.map(benefit => (
                        <div key={benefit.id} className="flex items-center space-x-2">
                            <Checkbox id={benefit.id} onCheckedChange={(checked) => handleBenefitChange(benefit.id, checked)} />
                            <label htmlFor={benefit.id} className="text-sm font-medium leading-none">{benefit.label}</label>
                        </div>
                    ))}
                </div>

                {selectedProperty && (
                    <div className="p-4 bg-white rounded-lg border text-center">
                        <p className="text-sm text-slate-600">Precio Original: <span className="line-through">${selectedProperty.price_per_night.toLocaleString()}</span></p>
                        <p className="text-lg font-bold text-red-600">Precio Oferta: ${offerPrice.toLocaleString()}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Guardando...' : 'Guardar Configuración'}</Button>
                </div>
            </CardContent>
        </Card>
    );
}