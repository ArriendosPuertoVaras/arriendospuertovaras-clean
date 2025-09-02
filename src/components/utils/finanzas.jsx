// Fórmulas financieras obligatorias para Chile
export const COMISION_PORCENTAJE = 0.15; // 15%
export const IVA_PORCENTAJE = 0.19;      // 19% sobre la comisión

/**
 * Calcula la comisión de la plataforma (15% del precio del operador)
 * @param {number} precioOperador - Precio definido por el operador
 * @returns {number} - Comisión calculada
 */
export function calcularComision(precioOperador) {
  return Math.round(precioOperador * COMISION_PORCENTAJE);
}

/**
 * Calcula el IVA sobre la comisión (19% de la comisión)
 * @param {number} comision - Comisión calculada
 * @returns {number} - IVA calculado
 */
export function calcularIVA(comision) {
  return Math.round(comision * IVA_PORCENTAJE);
}

/**
 * Calcula el precio final que paga el cliente
 * @param {number} precioOperador - Precio definido por el operador
 * @returns {Object} - {comision, iva, precioFinal}
 */
export function calcularPrecioFinal(precioOperador) {
  const comision = calcularComision(precioOperador);
  const iva = calcularIVA(comision);
  const precioFinal = precioOperador + comision + iva;
  
  return {
    comision,
    iva,
    precioFinal
  };
}

/**
 * Calcula el depósito al operador (precio íntegro)
 * @param {number} precioOperador - Precio definido por el operador
 * @returns {number} - Monto a depositar al operador
 */
export function calcularDepositoOperador(precioOperador) {
  return precioOperador; // El operador recibe su precio íntegro
}

/**
 * Calcula la ganancia neta de la plataforma (solo la comisión)
 * @param {number} precioOperador - Precio definido por el operador
 * @returns {number} - Ganancia neta de la plataforma
 */
export function calcularGananciaPlataforma(precioOperador) {
  return calcularComision(precioOperador); // La plataforma gana solo la comisión
}

/**
 * Formatea un monto en CLP
 * @param {number} monto - Monto a formatear
 * @returns {string} - Monto formateado
 */
export function formatearCLP(monto) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(monto);
}

/**
 * Aplica cálculos financieros a una lista de transacciones
 * @param {Array} transacciones - Lista de transacciones
 * @returns {Array} - Transacciones con cálculos aplicados
 */
export function aplicarCalculosFinancieros(transacciones) {
  return transacciones.map(tx => {
    const { comision, iva, precioFinal } = calcularPrecioFinal(tx.precio_operador || tx.monto_operador || 0);
    
    return {
      ...tx,
      comision,
      iva,
      precio_final: precioFinal,
      deposito_operador: calcularDepositoOperador(tx.precio_operador || tx.monto_operador || 0),
      ganancia_plataforma: calcularGananciaPlataforma(tx.precio_operador || tx.monto_operador || 0)
    };
  });
}