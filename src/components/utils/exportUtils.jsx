/**
 * Exporta datos a CSV
 * @param {Array} rows - Filas de datos
 * @param {string} filename - Nombre del archivo
 */
export function exportToCSV(rows, filename) {
  if (!rows || rows.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const keys = Object.keys(rows[0]);
  const csvContent = [
    keys.join(','), // Header
    ...rows.map(row => 
      keys.map(key => {
        const value = row[key];
        // Escapar comillas y envolver en comillas si contiene coma o salto de línea
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Exporta datos a XLSX (por ahora usa CSV como fallback)
 * @param {Array} rows - Filas de datos
 * @param {string} filename - Nombre del archivo
 */
export async function exportToXLSX(rows, filename) {
  // Por ahora, usamos CSV como fallback
  // En el futuro se puede integrar una librería como SheetJS
  const csvFilename = filename.replace(/\.xlsx$/i, '.csv');
  exportToCSV(rows, csvFilename);
  
  // TODO: Implementar exportación real a XLSX cuando se agregue la librería
  /*
  try {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.warn('XLSX no disponible, usando CSV como fallback');
    exportToCSV(rows, filename.replace(/\.xlsx$/i, '.csv'));
  }
  */
}

/**
 * Prepara datos para exportación con formato legible
 * @param {Array} rows - Filas de datos originales
 * @param {Object} columnMapping - Mapeo de columnas {key: 'Título Legible'}
 * @returns {Array} - Datos formateados para exportación
 */
export function prepareDataForExport(rows, columnMapping = {}) {
  return rows.map(row => {
    const exportRow = {};
    
    Object.keys(row).forEach(key => {
      const columnTitle = columnMapping[key] || key;
      let value = row[key];
      
      // Formatear fechas
      if (key.includes('_date') || key.includes('_at')) {
        value = value ? new Date(value).toLocaleString('es-CL') : '';
      }
      
      // Formatear montos
      if (key.includes('precio') || key.includes('monto') || key.includes('comision') || key.includes('iva')) {
        value = typeof value === 'number' ? `$${value.toLocaleString('es-CL')}` : value;
      }
      
      // Limpiar valores null/undefined
      if (value === null || value === undefined) {
        value = '';
      }
      
      exportRow[columnTitle] = value;
    });
    
    return exportRow;
  });
}