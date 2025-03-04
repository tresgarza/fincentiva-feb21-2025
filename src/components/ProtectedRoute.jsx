import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

/**
 * Componente para proteger rutas que requieren autenticación.
 * Redirige al login si no hay una sesión activa.
 */
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Verificar si hay datos de la empresa en localStorage
    const companyData = localStorage.getItem('companyData');
    
    // Si no hay datos y no estamos en la página de login, redirigir al login
    if (!companyData && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  // Verificar si hay datos de la empresa en localStorage
  const companyData = localStorage.getItem('companyData');
  
  // Si no hay datos y no estamos en la página de login, mostrar el componente de redirección
  if (!companyData && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }
  
  // Si hay datos o estamos en la página de login, mostrar los children
  return children;
};

export default ProtectedRoute; 