import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Plans from './pages/Plans';
import { isAuthenticated } from './utils/auth';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Verificar si el usuario está autenticado usando la utilidad
  if (!isAuthenticated()) {
    // Si no hay datos de autenticación o la sesión expiró, redirigir al login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Crear el enrutador con las rutas definidas
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/inicio",
    element: <ProtectedRoute><Home /></ProtectedRoute>
  },
  {
    path: "/planes",
    element: <ProtectedRoute><Plans /></ProtectedRoute>
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

// Componente principal que proporciona el enrutador
const AppWrapper = () => {
  return <RouterProvider router={router} />;
};

export default AppWrapper;
