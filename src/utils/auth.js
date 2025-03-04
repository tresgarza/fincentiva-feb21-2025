/**
 * Utility functions for authentication and session management
 */

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export const isAuthenticated = () => {
  const companyData = localStorage.getItem('companyData');
  const sessionData = localStorage.getItem('sessionData');
  
  if (!companyData || !sessionData) {
    return false;
  }
  
  // Verificar si la sesión ha expirado (8 horas)
  try {
    const { timestamp } = JSON.parse(sessionData);
    const sessionTime = new Date(timestamp).getTime();
    const currentTime = new Date().getTime();
    const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 horas en milisegundos
    
    if (currentTime - sessionTime > SESSION_DURATION) {
      // La sesión ha expirado, limpiar localStorage
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
};

/**
 * Logout the user by clearing localStorage
 */
export const logout = () => {
  localStorage.removeItem('companyData');
  localStorage.removeItem('sessionData');
};

/**
 * Get user data from localStorage
 * @returns {Object|null} User data or null if not authenticated
 */
export const getUserData = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const companyData = JSON.parse(localStorage.getItem('companyData'));
    return companyData;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}; 