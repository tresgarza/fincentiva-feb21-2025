import { useState, useEffect } from 'react';
import CompanyAuth from '../components/CompanyAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import logoCartotec from '../assets/logos/logo_empresa_cartotec.png';
import logoCadtoner from '../assets/logos/Logo_empresa_cadtoner.png';
import logoEtimex from '../assets/logos/logo_empresa_etimex.png';
import logoFortezza from '../assets/logos/logo_empresa_fortezza.png';
import logoPlastypel from '../assets/logos/logo_empresa_plastypel.png';
import logoUnoretail from '../assets/logos/logo_empresa_unoretail.png';
import logoMatamoros from '../assets/logos/logo_empresa_matamoros.png';
import logoLogistorage from '../assets/logos/logo_empresa_logistorage.png';
import logoMulligans from '../assets/logos/logo_empresa_mulligans.png';
import logoVallealto from '../assets/logos/logo_empresa_vallealto.png';

const Login = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si ya hay una sesión activa al cargar el componente
  useEffect(() => {
    try {
      const companyData = localStorage.getItem('companyData');
      
      // Verificar si los datos son válidos
      if (companyData) {
        try {
          const parsedData = JSON.parse(companyData);
          if (parsedData && parsedData.id) {
            setIsAuthenticated(true);
          } else {
            // Datos inválidos, limpiar localStorage
            console.log("Datos de autenticación inválidos, limpiando...");
            localStorage.removeItem('companyData');
            setIsAuthenticated(false);
          }
        } catch (e) {
          // Error al parsear JSON, limpiar localStorage
          console.error("Error al parsear datos de localStorage:", e);
          localStorage.removeItem('companyData');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleAuthenticated = (companyData) => {
    try {
      // Guardar los datos de la empresa en localStorage
      localStorage.setItem('companyData', JSON.stringify(companyData));
      
      // Actualizar el estado
      setIsAuthenticated(true);
      
      // Redirigir a la página de inicio
      navigate('/inicio', { replace: true });
    } catch (error) {
      console.error("Error al guardar datos de autenticación:", error);
      alert("Error al iniciar sesión. Por favor, intenta de nuevo.");
    }
  };

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-n-8 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#33FF57] rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir a inicio
  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }

  // Si no está autenticado, mostrar el formulario de login
  return (
    <div className="min-h-screen bg-n-8">
      <CompanyAuth onAuthenticated={handleAuthenticated} />
    </div>
  );
};

export default Login;

      {/* Trusted By Section */}
      <div className="mt-20 py-10 bg-n-8/50 backdrop-blur-sm rounded-2xl">
        <h3 className="text-center text-2xl font-bold mb-8">Confían en nosotros</h3>
        <div className="relative flex overflow-x-hidden">
          <div className="animate-scroll-logos py-6 flex items-center justify-around min-w-full whitespace-nowrap">
            {[
              { src: logoCartotec, alt: "Cartotec" },
              { src: logoCadtoner, alt: "Cadtoner" },
              { src: logoEtimex, alt: "Etimex" },
              { src: logoFortezza, alt: "Fortezza" },
              { src: logoPlastypel, alt: "Plastypel" },
              { src: logoUnoretail, alt: "Unoretail" },
              { src: logoMatamoros, alt: "Matamoros" },
              { src: logoLogistorage, alt: "Logistorage" },
              { src: logoMulligans, alt: "Mulligans" },
              { src: logoVallealto, alt: "Valle Alto" }
            ].map((logo, index) => (
              <div key={index} className="mx-8">
                <img 
                  src={logo.src} 
                  alt={logo.alt}
                  className="h-24 object-contain hover:scale-110 transition-transform duration-300 bg-white/50 backdrop-blur-sm rounded-lg p-4"
                />
              </div>
            ))}
          </div>
          <div className="animate-scroll-logos py-6 flex items-center justify-around min-w-full whitespace-nowrap">
            {[
              { src: logoCartotec, alt: "Cartotec" },
              { src: logoCadtoner, alt: "Cadtoner" },
              { src: logoEtimex, alt: "Etimex" },
              { src: logoFortezza, alt: "Fortezza" },
              { src: logoPlastypel, alt: "Plastypel" },
              { src: logoUnoretail, alt: "Unoretail" },
              { src: logoMatamoros, alt: "Matamoros" },
              { src: logoLogistorage, alt: "Logistorage" },
              { src: logoMulligans, alt: "Mulligans" },
              { src: logoVallealto, alt: "Valle Alto" }
            ].map((logo, index) => (
              <div key={index} className="mx-8">
                <img 
                  src={logo.src} 
                  alt={logo.alt}
                  className="h-24 object-contain hover:scale-110 transition-transform duration-300 bg-white/50 backdrop-blur-sm rounded-lg p-4"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

// ... existing code ... 