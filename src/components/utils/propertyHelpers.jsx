import { i18n } from './i18n';

// Helper para obtener el texto de una propiedad en el idioma actual
export const getLocalizedPropertyText = (property, field) => {
  const currentLang = i18n.getCurrentLanguage();
  
  if (currentLang === 'en' && property[`${field}_en`]) {
    return property[`${field}_en`];
  }
  
  return property[field] || '';
};

// Helper para obtener amenities localizadas
export const getLocalizedAmenities = (amenities = []) => {
  const currentLang = i18n.getCurrentLanguage();
  
  return amenities.map(amenity => ({
    ...amenity,
    label: currentLang === 'en' && amenity.label_en ? amenity.label_en : amenity.label
  }));
};

// Helper para obtener categoría traducida
export const getLocalizedCategory = (category) => {
  return i18n.t(`category.${category}`);
};