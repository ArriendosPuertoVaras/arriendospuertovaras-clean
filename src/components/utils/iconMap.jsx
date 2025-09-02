import {
  Wrench,
  Sparkles,
  TreePine,
  Truck,
  Home,
  Smile,
  Info,
  BookOpen,
  Construction,
  Bike,
  Waves,
  Mountain,
  HeartPulse,
  Utensils,
  Car,
  Wind,
  Bus,
  Zap,
  Camera,
  Droplets,
  Briefcase,
  Hammer,
  Heart,
  Clock,
  Shirt,
  Paintbrush,
  Key,
  Scissors,
  Package,
  Settings,
  Shield,
  Plug,
  ChefHat,
  Languages,
  Palette,
  Dumbbell,
  Plane,
  Music,
  ShoppingBag,
  PartyPopper,
  Beer,
  Grape,
  Coffee,
  Star,
  User,
  Ship,
  Fish,
  Users,
  Baby
} from "lucide-react";

export const getIconForCategory = (service) => {
  // Mapeo exhaustivo por slug y variaciones
  const iconMap = {
    // Servicios del hogar
    'cuidado-domicilio': Heart,
    'babysitter-ninera': Baby,
    'cuidado-adultos-mayores': Users,
    'mascotas': Heart,
    'limpieza-aseo-profesional': Sparkles,
    'aseo-puntual': Clock,
    'limpieza-profunda': Sparkles,
    'post-arriendo': Home,
    'lavanderia-planchado': Shirt,
    'mantenimiento-reparaciones': Wrench,
    'electricidad': Zap,
    'gasfiteria': Droplets,
    'pintura': Paintbrush,
    'carpinteria': Hammer,
    'cerrajeria': Key,
    'jardineria-areas-verdes': TreePine,
    'corte-cesped': Scissors,
    'paisajismo': TreePine,
    'riego-mantencion': Droplets,
    'mejoras-remodelaciones': Construction,
    'obras-menores': Hammer,
    'construccion-ampliaciones': Construction,
    'diseno-interiores': Palette,
    'fletes-mudanzas': Truck,
    'traslados-pequenos': Package,
    'mudanzas-completas': Truck,
    'arriendo-camiones': Truck,
    'servicios-utiles': Settings,
    'sanitizacion': Shield,
    'instalacion-electrodomesticos': Plug,
    'administracion-propiedades': Briefcase,
    'clases-talleres-domicilio': BookOpen,
    'cocina-reposteria': ChefHat,
    'idiomas': Languages,
    'artes-manualidades': Palette,
    'deportes-entrenamiento': Dumbbell,
    
    // Experiencias y turismo
    'transporte-transfers': Bus,
    'transfer-aeropuerto': Plane,
    'traslados-privados': Car,
    'renta-vans-minibuses': Bus,
    'tours-excursiones': Bike,
    'petrohue-todos-santos': Waves,
    'volcan-osorno': Mountain,
    'carretera-austral-cochamo': Mountain,
    'llanquihue-frutillar': Waves,
    'aventura-aire-libre': Mountain,
    'trekking-hiking': Mountain,
    'kayak-rafting': Waves,
    'pesca-deportiva': Fish,
    'mountainbike': Bike,
    'bienestar-relajacion': Wind,
    'spas-termas': Waves,
    'yoga-meditacion': Wind,
    'masajes': Heart,
    'eventos-cultura-local': Music,
    'ferias-artesanales': ShoppingBag,
    'musica-espectaculos': Music,
    'fiestas-costumbristas': PartyPopper,
    'gastronomia-catas': Utensils,
    'tours-cerveceros': Beer,
    'visitas-vinas': Grape,
    'catas-chocolate-cafe': Coffee,
    'experiencias-gastronomicas-casas': Home,
    'experiencias-medida': Star,
    'guias-privados': User,
    'paquetes-personalizados': Package,
    'fotografos-turisticos': Camera,
    
    // Arriendo de vehículos
    'autos': Car,
    'vans': Truck,
    'motorhomes-casas-rodantes': Home,
    'bicicletas-ebikes': Bike,
    'lanchas-embarcaciones': Ship,
    
    // Clases y talleres
    'cocina-local-reposteria': ChefHat,
    'clases-kayak-rafting': Waves,
    'talleres-fotografia': Camera,
    'clases-idioma': Languages,
    'clases-deportivas': Dumbbell
  };

  // Mapeo de respaldo por nombre de ícono
  const iconByName = {
    'Wrench': Wrench,
    'Sparkles': Sparkles,
    'TreePine': TreePine,
    'Truck': Truck,
    'Construction': Construction,
    'Hammer': Hammer,
    'Smile': Smile,
    'Info': Info,
    'BookOpen': BookOpen,
    'Bike': Bike,
    'Waves': Waves,
    'Mountain': Mountain,
    'HeartPulse': HeartPulse,
    'Wind': Wind,
    'Utensils': Utensils,
    'Car': Car,
    'Bus': Bus,
    'Zap': Zap,
    'Camera': Camera,
    'Droplets': Droplets,
    'Briefcase': Briefcase,
    'Home': Home,
    'Heart': Heart,
    'Clock': Clock,
    'Shirt': Shirt,
    'Paintbrush': Paintbrush,
    'Key': Key,
    'Scissors': Scissors,
    'Package': Package,
    'Settings': Settings,
    'Shield': Shield,
    'Plug': Plug,
    'ChefHat': ChefHat,
    'Languages': Languages,
    'Palette': Palette,
    'Dumbbell': Dumbbell,
    'Plane': Plane,
    'Music': Music,
    'ShoppingBag': ShoppingBag,
    'PartyPopper': PartyPopper,
    'Beer': Beer,
    'Grape': Grape,
    'Coffee': Coffee,
    'Star': Star,
    'User': User,
    'Ship': Ship,
    'Fish': Fish,
    'Users': Users,
    'Baby': Baby
  };

  // 1. Buscar por slug
  if (service.slug && iconMap[service.slug]) {
    return iconMap[service.slug];
  }
  
  // 2. Buscar por nombre de ícono
  if (service.icon && iconByName[service.icon]) {
    return iconByName[service.icon];
  }
  
  // 3. Fallback por nombre de categoría (buscar palabras clave)
  if (service.name) {
    const name = service.name.toLowerCase();
    if (name.includes('gastronomía') || name.includes('gastronomia') || name.includes('catas') || name.includes('cocina')) return Utensils;
    if (name.includes('bienestar') || name.includes('relajación') || name.includes('relajo') || name.includes('spa')) return Wind;
    if (name.includes('transporte') || name.includes('transfer') || name.includes('movilidad')) return Bus;
    if (name.includes('aventura') || name.includes('deportes') || name.includes('aire libre')) return Mountain;
    if (name.includes('tours') || name.includes('excursiones')) return Bike;
    if (name.includes('vehiculos') || name.includes('arriendo') || name.includes('auto')) return Car;
    if (name.includes('limpieza') || name.includes('aseo')) return Sparkles;
    if (name.includes('jardín') || name.includes('jardin') || name.includes('verde')) return TreePine;
    if (name.includes('construcción') || name.includes('construccion') || name.includes('remodelación')) return Construction;
    if (name.includes('electricidad')) return Zap;
    if (name.includes('plomería') || name.includes('plomeria') || name.includes('gasfiter')) return Droplets;
    if (name.includes('clases') || name.includes('talleres')) return BookOpen;
    if (name.includes('cuidado') || name.includes('babysitter')) return Heart;
  }
  
  // 4. Ícono por defecto
  return Info;
};