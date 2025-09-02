import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronUp, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const allAmenities = {
  generales: [
    { id: 'estacionamiento_privado', label: 'Estacionamiento privado/techado' },
    { id: 'estacionamiento_calle', label: 'Estacionamiento en la calle' },
    { id: 'acceso_pmr', label: 'Acceso para silla de ruedas' },
    { id: 'check_in_24h', label: 'Check-in 24 horas' },
    { id: 'wifi_alta_velocidad', label: 'Wifi alta velocidad' },
    { id: 'tv_smart_tv', label: 'TV / Smart TV' },
    { id: 'calefaccion', label: 'Calefacción' },
    { id: 'aire_acondicionado', label: 'Aire acondicionado' },
  ],
  relajacion_bienestar: [
    { id: 'tinaja_caliente', label: 'Tinaja caliente (Hot tub)' },
    { id: 'sauna', label: 'Sauna' },
    { id: 'spa_masajes', label: 'Servicio de Spa/masajes' },
    { id: 'piscina_climatizada', label: 'Piscina climatizada' },
    { id: 'piscina_exterior', label: 'Piscina exterior' },
    { id: 'jacuzzi', label: 'Jacuzzi' },
  ],
  cocina_gastronomia: [
    { id: 'quincho_techado', label: 'Quincho techado' },
    { id: 'cocina_equipada', label: 'Cocina equipada' },
    { id: 'parrilla_exterior', label: 'Parrilla exterior' },
    { id: 'horno_de_barro', label: 'Horno de barro' },
    { id: 'maquina_cafe', label: 'Máquina de café' },
  ],
  actividades_entretenimiento: [
    { id: 'bicicletas', label: 'Bicicletas disponibles' },
    { id: 'kayaks_botes', label: 'Kayaks/botes' },
    { id: 'juegos_mesa', label: 'Juegos de mesa' },
    { id: 'pool_pingpong', label: 'Mesa de Pool / Ping-pong' },
    { id: 'zona_fogata', label: 'Zona de fogata' },
  ],
  servicios_adicionales: [
    { id: 'limpieza', label: 'Servicio de limpieza' },
    { id: 'desayuno', label: 'Desayuno' },
    { id: 'compra_alimentos', label: 'Compra previa de alimentos' },
    { id: 'transfer_aeropuerto', label: 'Transfer aeropuerto' },
    { id: 'tours_guiados', label: 'Tours guiados' },
    { id: 'permite_mascotas', label: 'Se permiten mascotas' },
  ],
};

const AmenityItem = ({ amenity, selection, onToggle, onDetailChange }) => {
  const isEnabled = !!selection;

  return (
    <div className="flex flex-col space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={`switch-${amenity.id}`} className="font-medium">{amenity.label}</Label>
        <Switch
          id={`switch-${amenity.id}`}
          checked={isEnabled}
          onCheckedChange={(checked) => onToggle(amenity, checked)}
        />
      </div>
      {isEnabled && (
        <div className="space-y-4 pl-2 border-l-2 ml-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`check-${amenity.id}`}
              checked={selection.included}
              onCheckedChange={(checked) => onDetailChange(amenity.id, 'included', checked)}
            />
            <Label htmlFor={`check-${amenity.id}`}>Incluido en el precio base</Label>
          </div>
          {!selection.included && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor={`price-${amenity.id}`}>Precio (CLP)</Label>
                <Input
                  id={`price-${amenity.id}`}
                  type="number"
                  value={selection.price || ''}
                  onChange={(e) => onDetailChange(amenity.id, 'price', parseInt(e.target.value) || 0)}
                  placeholder="Ej: 15000"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`unit-${amenity.id}`}>Unidad</Label>
                <Select
                  value={selection.unit}
                  onValueChange={(value) => onDetailChange(amenity.id, 'unit', value)}
                >
                  <SelectTrigger id={`unit-${amenity.id}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="por_dia">Por día</SelectItem>
                    <SelectItem value="por_noche">Por noche</SelectItem>
                    <SelectItem value="por_hora">Por hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function AmenitySelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState({});

  useEffect(() => {
    // Convert array from props to a map for easier manipulation
    const map = (value || []).reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
    setSelectedAmenities(map);
  }, [value]);

  const handleToggle = (amenity, checked) => {
    const newSelection = { ...selectedAmenities };
    if (checked) {
      newSelection[amenity.id] = {
        id: amenity.id,
        label: amenity.label,
        included: true,
        price: 0,
        unit: 'por_dia',
      };
    } else {
      delete newSelection[amenity.id];
    }
    setSelectedAmenities(newSelection);
  };

  const handleDetailChange = (id, field, fieldValue) => {
    const newSelection = { ...selectedAmenities };
    if (newSelection[id]) {
      newSelection[id] = { ...newSelection[id], [field]: fieldValue };
      setSelectedAmenities(newSelection);
    }
  };

  const handleSave = () => {
    // Validation
    for (const key in selectedAmenities) {
      const item = selectedAmenities[key];
      if (!item.included && (!item.price || item.price <= 0)) {
        toast.error(`Por favor, define un precio para "${item.label}".`);
        return;
      }
    }
    // Convert map back to array for parent component
    onChange(Object.values(selectedAmenities));
    setIsOpen(false);
    toast.success('Servicios y comodidades guardados.');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar o editar servicios y comodidades
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Servicios y Comodidades</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-4">
          {Object.entries(allAmenities).map(([category, items]) => (
            <Collapsible key={category} defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md bg-slate-100 px-4 py-2 text-left font-medium">
                <span className="capitalize">{category.replace(/_/g, ' ')}</span>
                <ChevronUp className="h-4 w-4 transition-transform data-[state=closed]:-rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 p-2 pt-4">
                {items.map((amenity) => (
                  <AmenityItem
                    key={amenity.id}
                    amenity={amenity}
                    selection={selectedAmenities[amenity.id]}
                    onToggle={handleToggle}
                    onDetailChange={handleDetailChange}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
        <SheetFooter className="sticky bottom-0 bg-white py-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}