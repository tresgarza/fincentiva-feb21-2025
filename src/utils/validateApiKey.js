/**
 * Utilidad para validar y limpiar la clave API de Supabase
 */

/**
 * Valida y limpia una clave API de Supabase
 * @param {string} key - La clave API original a validar
 * @returns {object} - Objeto con la clave limpia y mensajes de diagnóstico
 */
export const validateAndCleanSupabaseKey = (key) => {
  const result = {
    originalKey: key,
    cleanedKey: key,
    isValid: true,
    messages: [],
    diagnostics: {}
  };

  if (!key) {
    result.isValid = false;
    result.messages.push('La clave API está vacía o no definida');
    return result;
  }

  // Verificar espacios en blanco
  const trimmedKey = key.trim();
  if (trimmedKey !== key) {
    result.messages.push('La clave API contiene espacios en blanco al inicio o final');
    result.cleanedKey = trimmedKey;
    result.diagnostics.originalLength = key.length;
    result.diagnostics.trimmedLength = trimmedKey.length;
  }

  // Verificar formato JWT básico
  if (!trimmedKey.startsWith('eyJ') || !trimmedKey.includes('.')) {
    result.isValid = false;
    result.messages.push('La clave API no tiene el formato JWT esperado');
  } else {
    // Intentar decodificar para validar estructura
    try {
      const parts = trimmedKey.split('.');
      if (parts.length !== 3) {
        result.isValid = false;
        result.messages.push('La clave JWT debe tener 3 partes separadas por puntos');
      } else {
        // Verificar que es decodificable
        try {
          const payload = JSON.parse(atob(parts[1]));
          result.diagnostics.jwt = {
            role: payload.role,
            issuedAt: new Date(payload.iat * 1000).toISOString(),
            expiresAt: new Date(payload.exp * 1000).toISOString()
          };
          
          // Verificar campos esperados
          if (!payload.role) {
            result.messages.push('La clave JWT no contiene un rol definido');
          }
          
          // Verificar expiración
          const now = Date.now() / 1000;
          if (payload.exp < now) {
            result.isValid = false;
            result.messages.push('La clave JWT ha expirado');
          }
        } catch (e) {
          result.isValid = false;
          result.messages.push(`Error al decodificar el payload JWT: ${e.message}`);
        }
      }
    } catch (e) {
      result.isValid = false;
      result.messages.push(`Error al procesar la clave JWT: ${e.message}`);
    }
  }

  return result;
};

/**
 * Obtiene una versión limpia de la clave API
 * @param {string} key - La clave API original
 * @returns {string} - La clave limpia o la original si no hubo cambios
 */
export const getCleanApiKey = (key) => {
  const validation = validateAndCleanSupabaseKey(key);
  return validation.cleanedKey;
};

export default validateAndCleanSupabaseKey; 