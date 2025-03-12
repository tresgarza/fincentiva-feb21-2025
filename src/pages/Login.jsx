import CompanyAuth from '../components/CompanyAuth';
import Footer from '../components/Footer';
import WarningBanner from '../components/WarningBanner';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const companyData = localStorage.getItem('companyData');
    if (companyData) {
      // Si ya está autenticado, redirigir a la página de inicio
      navigate('/inicio');
    }
  }, [navigate]);

  const handleAuthenticated = (companyData) => {
    // Log para depurar
    console.log('Datos de la empresa en handleAuthenticated:', companyData);
    console.log('Datos del usuario en handleAuthenticated:', companyData.user_data);
    
    // Guardar los datos de la empresa en localStorage
    localStorage.setItem('companyData', JSON.stringify(companyData));
    
    // Verificar que se guardó correctamente
    const storedData = JSON.parse(localStorage.getItem('companyData') || '{}');
    console.log('Datos guardados en localStorage:', storedData);
    console.log('Teléfono guardado en localStorage:', storedData.user_data?.phone);
    
    // Redirigir a la página que intentaba acceder o a la página de inicio por defecto
    const from = location.state?.from || '/inicio';
    navigate(from);
  };

  return (
    <div className="min-h-screen bg-n-8 flex flex-col">
      {/* El banner se muestra una sola vez, justo al inicio */}
      <div className="sticky top-0 z-50 w-full">
        <WarningBanner />
      </div>
      <div className="flex-grow">
        <CompanyAuth onAuthenticated={handleAuthenticated} />
      </div>
      <Footer />
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