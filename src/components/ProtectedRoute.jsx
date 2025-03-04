import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Componente para proteger rutas que requieren autenticación.
 * Redirige al login si no hay una sesión activa.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    // Verificar si hay datos de la empresa en localStorage
    try {
      const companyData = localStorage.getItem('companyData');
      setIsAuthenticated(!!companyData);
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      setIsAuthenticated(false);
    }
  }, []);

  // Mientras verificamos la autenticación, mostrar un loader
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#33FF57] rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  // Si no está autenticado y no estamos en la página de login, redirigir al login
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }
  
  // Si está autenticado o estamos en la página de login, mostrar los children
  return children;
};

export default ProtectedRoute; 