import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem('companyData') !== null;

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    // Guardar la ruta a la que intentaba acceder para redirigir después del login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute; 