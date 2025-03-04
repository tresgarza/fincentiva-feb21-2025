/**
 * Utilidades para manejar la autenticación en la aplicación
 */

/**
 * Verifica si hay datos de autenticación en localStorage y si son válidos
 * @returns {boolean} true si hay datos válidos, false en caso contrario
 */
export const isAuthenticated = () => {
  try {
    const companyData = localStorage.getItem('companyData');
    if (!companyData) return false;

    // Intentar parsear los datos
    const parsedData = JSON.parse(companyData);
    
    // Verificar si los datos tienen las propiedades requeridas
    return !!(parsedData && parsedData.id);
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
};

/**
 * Obtiene los datos del usuario autenticado
 * @returns {object|null} Datos del usuario o null si no hay usuario autenticado
 */
export const getAuthUser = () => {
  try {
    const companyData = localStorage.getItem('companyData');
    if (!companyData) return null;

    return JSON.parse(companyData);
  } catch (error) {
    console.error('Error al obtener datos de usuario:', error);
    return null;
  }
};

/**
 * Guarda los datos de autenticación en localStorage
 * @param {object} userData - Datos del usuario a guardar
 */
export const setAuthUser = (userData) => {
  try {
    localStorage.setItem('companyData', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error al guardar datos de autenticación:', error);
    return false;
  }
};

/**
 * Elimina los datos de autenticación del localStorage
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem('companyData');
    return true;
  } catch (error) {
    console.error('Error al eliminar datos de autenticación:', error);
    return false;
  }
};

/**
 * Repara la sesión en caso de datos corruptos
 * @returns {boolean} true si la sesión se reparó o no necesitaba reparación, false si ocurrió un error
 */
export const repairSession = () => {
  try {
    const companyData = localStorage.getItem('companyData');
    
    // Si no hay datos, no hay nada que reparar
    if (!companyData) return true;
    
    try {
      // Verificar si los datos son JSON válido
      const parsedData = JSON.parse(companyData);
      
      // Si no tiene id, limpiar los datos
      if (!parsedData || !parsedData.id) {
        localStorage.removeItem('companyData');
      }
      
      return true;
    } catch (e) {
      // Si no es JSON válido, limpiar los datos
      localStorage.removeItem('companyData');
      return true;
    }
  } catch (error) {
    console.error('Error al reparar sesión:', error);
    // En caso de error, intentar limpiar la sesión
    try {
      localStorage.removeItem('companyData');
    } catch {}
    return false;
  }
}; 