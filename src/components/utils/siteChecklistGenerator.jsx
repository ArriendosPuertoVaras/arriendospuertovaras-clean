import { siteStructure } from "@/components/utils/sitemapData";

/**
 * Genera un checklist en formato CSV a partir de la estructura del sitio.
 * @returns {string} - El contenido del archivo CSV.
 */
export const generateCSVChecklist = () => {
  const today = new Date().toISOString().split('T')[0];
  
  let csv = `"ID","Nivel","Página/Función","URL","Estado Actual","Observaciones","Responsable","Fecha Revisión"\n`;
  let id = 1;

  const addRow = (level, page) => {
    // Limpia la URL de parámetros dinámicos para el checklist
    const cleanUrl = page.url.replace(/(\?|:)[^/]+$/, '');
    const name = page.name.replace(/"/g, '""'); // Escapa comillas dobles

    // Columnas vacías para que el equipo las llene
    const status = "";
    const notes = "";
    const owner = "";
    const reviewDate = "";

    csv += `"${id++}","${level}","${name}","${cleanUrl}","${status}","${notes}","${owner}","${reviewDate}"\n`;
  };

  // Itera sobre todas las secciones de la estructura del sitio
  const processSection = (sectionName, sectionData) => {
    Object.values(sectionData).forEach(page => addRow(sectionName, page));
  };

  processSection('Páginas Principales', siteStructure.mainPages);
  processSection('Páginas de Detalle', siteStructure.detailPages);
  processSection('Gestión de Usuario', siteStructure.userManagement);
  processSection('Gestión de Anfitrión', siteStructure.hostManagement);
  processSection('Funciones Especiales', siteStructure.specialFeatures);
  processSection('Páginas de Contenido', siteStructure.contentPages);
  processSection('Servicios Profesionales', siteStructure.professionalServices);
  processSection('Páginas Legales', siteStructure.legalPages);
  processSection('Funciones de Admin', siteStructure.adminFeatures);
  processSection('Integraciones IA', siteStructure.aiIntegrations);

  return csv;
};