import CompanyAuth from '../components/CompanyAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
  const location = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  
  // Verificar si ya hay una sesión activa
  useEffect(() => {
    // Evitar múltiples redirecciones
    if (redirecting) return;
    
    const companyData = localStorage.getItem('companyData');
    if (companyData) {
      setRedirecting(true);
      // Si ya hay una sesión, redirigir a inicio
      const from = location.state?.from?.pathname || '/inicio';
      navigate(from, { replace: true });
    }
  }, [navigate, location, redirecting]);

  const handleAuthenticated = (companyData) => {
    // Evitar múltiples redirecciones
    if (redirecting) return;
    setRedirecting(true);
    
    // Guardar los datos de la empresa y usuario en localStorage
    localStorage.setItem('companyData', JSON.stringify(companyData));
    
    // Crear timestamp de inicio de sesión
    const sessionData = {
      timestamp: new Date().toISOString(),
      userId: `${companyData.user.firstName}_${companyData.user.lastName}`.toLowerCase()
    };
    localStorage.setItem('sessionData', JSON.stringify(sessionData));
    
    // Redirigir a la página de inicio o a la página que intentaba acceder
    const from = location.state?.from?.pathname || '/inicio';
    navigate(from, { replace: true });
  };

  // Si ya estamos redirigiendo, no mostrar nada para evitar parpadeos
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-n-8">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-n-1 border-t-[#33FF57] rounded-full animate-spin"></div>
          <p className="mt-2 text-n-1">Iniciando sesión...</p>
        </div>
      </div>
    );
  }

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