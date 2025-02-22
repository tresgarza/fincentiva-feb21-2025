import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyAuth from '../components/CompanyAuth';
import ButtonGradient from '../assets/svg/ButtonGradient';
import Typewriter from 'typewriter-effect';
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

  const handleCompanyAuthenticated = (companyData) => {
    // Guardar los datos de la compañía en localStorage
    localStorage.setItem('companyData', JSON.stringify(companyData));
    // Redirigir a la página de inicio
    navigate('/inicio');
  };

  return (
    <div className="min-h-screen bg-n-8 text-n-1 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#33FF57] to-[#40E0D0] opacity-30 animate-pulse-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-[90rem] mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-7xl font-bold mb-8 bg-gradient-to-r from-[#33FF57] via-[#40E0D0] to-[#3FD494] bg-clip-text text-transparent">
              Fincentiva
            </h1>
            <div className="text-3xl text-n-3 h-20 mb-4">
              <Typewriter
                options={{
                  strings: [
                    'Financia tus sueños...',
                    'Compra muebles...',
                    'Adquiere electrodomésticos...',
                    'Renueva tu tecnología...',
                    'Lo que necesites en los mejores marketplace de México'
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 30,
                }}
              />
            </div>
            <p className="text-n-3 text-xl max-w-3xl mx-auto">
              Plataforma empresarial de financiamiento que permite a tus empleados adquirir productos y servicios con facilidades de pago
            </p>
          </div>

          <div className="flex flex-wrap gap-8 items-stretch justify-center">
            {/* Login Form */}
            <div className="w-full max-w-[28rem]">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#33FF57] via-[#40E0D0] to-[#3FD494] rounded-2xl opacity-75 blur animate-gradient"></div>
                
                <div className="relative bg-n-8 rounded-[1rem] p-8 shadow-2xl backdrop-blur-sm">
                  <h3 className="h3 mb-6 text-center bg-gradient-to-r from-[#33FF57] to-[#40E0D0] bg-clip-text text-transparent">
                    Portal Empresarial
                  </h3>
                  <CompanyAuth onAuthenticated={handleCompanyAuthenticated} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ButtonGradient />

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
    </div>
  );
};

export default Login; 