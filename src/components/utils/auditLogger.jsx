import { AdminAudit } from '@/api/entities';
import { User } from '@/api/entities';

/**
 * Registra una acción de auditoría en el sistema
 * @param {string} action - Descripción de la acción realizada
 * @param {string} resourceType - Tipo de recurso afectado (Property, User, etc.)
 * @param {string} resourceId - ID del recurso afectado
 * @param {Object} beforeState - Estado anterior del recurso (opcional)
 * @param {Object} afterState - Estado posterior del recurso (opcional)
 */
export async function logAudit(action, resourceType, resourceId, beforeState = null, afterState = null) {
  try {
    const user = await User.me();
    if (!user) {
      console.warn('Cannot log audit: No authenticated user');
      return;
    }

    // Solo registrar auditoría para usuarios admin
    if (!['superadmin', 'admin', 'editor', 'moderador'].includes(user.role)) {
      return;
    }

    const auditData = {
      admin_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      before_state: beforeState ? {
        ...beforeState,
        // Ocultar información sensible
        password: beforeState.password ? '[HIDDEN]' : undefined,
        bank_account: beforeState.bank_account ? '[HIDDEN]' : undefined
      } : null,
      after_state: afterState ? {
        ...afterState,
        // Ocultar información sensible
        password: afterState.password ? '[HIDDEN]' : undefined, 
        bank_account: afterState.bank_account ? '[HIDDEN]' : undefined
      } : null,
      ip_address: await getCurrentUserIP()
    };

    await AdminAudit.create(auditData);
  } catch (error) {
    console.error('Error logging audit:', error);
    // No lanzar error para no interrumpir la operación principal
  }
}

/**
 * Obtiene la IP del usuario actual (simplificado)
 */
async function getCurrentUserIP() {
  try {
    // En un entorno real, esto vendría del servidor
    // Por ahora, usar un placeholder
    return 'client-ip';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Hook para auditoría automática en operaciones CRUD
 */
export const auditActions = {
  /**
   * Registra creación de recurso
   */
  created: (resourceType, resourceId, newState) => 
    logAudit(`${resourceType} created`, resourceType, resourceId, null, newState),

  /**
   * Registra actualización de recurso
   */
  updated: (resourceType, resourceId, oldState, newState) => 
    logAudit(`${resourceType} updated`, resourceType, resourceId, oldState, newState),

  /**
   * Registra eliminación de recurso
   */
  deleted: (resourceType, resourceId, oldState) => 
    logAudit(`${resourceType} deleted`, resourceType, resourceId, oldState, null),

  /**
   * Registra aprobación de recurso
   */
  approved: (resourceType, resourceId, newState) => 
    logAudit(`${resourceType} approved`, resourceType, resourceId, null, newState),

  /**
   * Registra rechazo de recurso
   */
  rejected: (resourceType, resourceId, newState) => 
    logAudit(`${resourceType} rejected`, resourceType, resourceId, null, newState),

  /**
   * Registra cambio de configuración
   */
  configChanged: (setting, oldValue, newValue) => 
    logAudit(`Configuration changed: ${setting}`, 'Configuration', setting, 
             { value: oldValue }, { value: newValue }),

  /**
   * Registra acceso a datos sensibles
   */
  dataAccessed: (resourceType, resourceId) => 
    logAudit(`Sensitive data accessed: ${resourceType}`, resourceType, resourceId)
};