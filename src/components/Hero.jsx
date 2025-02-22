import { useRef } from "react";
import { ScrollParallax } from "react-just-parallax";
import { heroIcons } from "../constants";
import { curve } from "../assets";
import CompanyLogos from "./CompanyLogos";
import { BackgroundCircles, BottomLine, Gradient } from "./design/Hero";
import Section from "./Section";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
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

const Hero = () => {
  const parallaxRef = useRef(null);

  const marketplaces = [
    {
      name: "Amazon",
      description: "Millones de productos con envío rápido y garantizado",
      url: "https://www.amazon.com.mx",
      color: "text-[#FF9900]",
      icon: "🛍️"
    },
    {
      name: "Financiar Producto",
      description: "Simula un crédito para tus compras en línea y elige el mejor plan de pagos",
      isSimulator: true,
      simulatorType: 'product',
      color: "text-[#33FF57]",
      icon: "💳"
    },
    {
      name: "Solicitar Efectivo",
      description: "Calcula tu capacidad de crédito y obtén el efectivo que necesitas",
      isSimulator: true,
      simulatorType: 'cash',
      color: "text-[#33FF57]",
      icon: "💰"
    },
    {
      name: "MercadoLibre",
      description: "La mayor plataforma de comercio electrónico en México",
      url: "https://www.mercadolibre.com.mx",
      color: "text-[#FFE600]",
      icon: "🌟"
    }
  ];

  useGSAP(() => {
    // Fade in cards with stagger
    gsap.from(".marketplace-card", {
      opacity: 0,
      y: 20,
      duration: 1,
      stagger: 0.3,
      ease: "power3.out"
    });
  });

  return (
    <Section
      className="pt-[8rem] -mt-[5.25rem] overflow-hidden"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="hero"
    >
      <div ref={parallaxRef} className="container relative">
        <div className="relative z-1 mx-auto text-center mb-[2rem] md:mb-8 lg:mb-[2rem]">
          <div className="max-w-[45rem] mx-auto">
            <h1 className="h1 mb-6">
              <div className="h-[100px] flex items-center justify-center">
                <Typewriter
                  options={{
                    strings: [
                      'Simula tu crédito al instante',
                      'Calcula tu capacidad de pago',
                      'Financia tus compras en línea',
                      'Obtén efectivo de inmediato',
                      'Elige el plan que más te convenga'
                    ],
                    autoStart: true,
                    loop: true,
                    deleteSpeed: 30,
                    delay: 100,
                    pauseFor: 2500
                  }}
                />
              </div>
            </h1>
            <p className="body-1 max-w-2xl mx-auto mb-6 text-n-2 lg:mb-8 text-base">
              Descubre cuánto puedes solicitar según tus ingresos y elige el plan de pagos 
              que mejor se adapte a tu presupuesto. Sin complicaciones, 100% en línea.
            </p>
          </div>

          {/* Nueva estructura responsiva */}
          <div className="max-w-[80rem] mx-auto px-4 sm:px-6">
            {/* Grid container con diseño responsivo */}
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-4 lg:gap-8">
              {/* Tarjeta Amazon (Izquierda) - Más pequeña en móvil */}
              <a
                href="https://www.amazon.com.mx"
                target="_blank"
                rel="noopener noreferrer"
                className="marketplace-card block p-4 lg:p-6 rounded-xl bg-n-7 border border-n-1/10 
                  transition-all duration-300 hover:scale-[1.02] hover:bg-n-6 relative overflow-hidden transform-gpu
                  h-[120px] lg:h-auto"
              >
                <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                  <span className="text-2xl lg:text-3xl">🛍️</span>
                  <div className="text-xl lg:text-2xl font-bold text-[#FF9900] transition-colors duration-300">
                    Amazon
                  </div>
                </div>
                
                <p className="text-n-3 text-xs lg:text-sm transition-colors duration-300 group-hover:text-n-1">
                  Millones de productos con envío rápido y garantizado
                </p>
              </a>

              {/* Guía Visual Animada (Centro) - Ocupa todo el ancho en móvil */}
              <div className="max-w-full lg:max-w-[40rem] p-4 lg:p-6 rounded-xl bg-n-7/50 backdrop-blur-sm border border-n-1/10">
                <h3 className="text-lg font-bold mb-4 text-[#33FF57]">¿Cómo funciona?</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Financiar Producto */}
                  <div 
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.setActiveForm) {
                        window.setActiveForm('product');
                      }
                    }}
                    className="relative p-4 rounded-lg bg-n-6/50 overflow-hidden group hover:bg-n-6 transition-colors cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 px-3 py-2 bg-[#33FF57]/20 text-[#33FF57] text-xs rounded-bl-lg">
                      Opción 1
                    </div>
                    <div className="pt-6">
                      <h4 className="text-base font-semibold mb-2 text-n-1">Financiar un Producto</h4>
                      <ol className="text-sm text-n-3 space-y-2 text-left">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#33FF57]/20 text-[#33FF57] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                          <span>Elige tu producto en Amazon o MercadoLibre</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#33FF57]/20 text-[#33FF57] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                          <span>Copia el enlace del producto</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#33FF57]/20 text-[#33FF57] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                          <span>Pégalo en nuestro simulador y calcula tu plan de pagos</span>
                        </li>
                      </ol>
                      <div className="mt-3 h-8 bg-n-7 rounded overflow-hidden relative group-hover:bg-n-8 transition-colors">
                        <div className="absolute inset-0 flex items-center px-2 text-xs text-n-3 animate-type-url">
                          https://www.amazon.com.mx/producto...
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solicitar Efectivo */}
                  <div 
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.setActiveForm) {
                        window.setActiveForm('amount');
                      }
                    }}
                    className="relative p-4 rounded-lg bg-n-6/50 overflow-hidden group hover:bg-n-6 transition-colors cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 px-3 py-2 bg-[#33FF57]/20 text-[#33FF57] text-xs rounded-bl-lg">
                      Opción 2
                    </div>
                    <div className="pt-6">
                      <h4 className="text-base font-semibold mb-2 text-n-1">Solicitar Efectivo</h4>
                      <ol className="text-sm text-n-3 space-y-2 text-left">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#33FF57]/20 text-[#33FF57] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                          <span>Ingresa el monto que necesitas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#33FF57]/20 text-[#33FF57] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                          <span>Indica tus ingresos mensuales</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#33FF57]/20 text-[#33FF57] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                          <span>Obtén tu plan de pagos personalizado</span>
                        </li>
                      </ol>
                      <div className="mt-3 h-8 bg-n-7 rounded overflow-hidden relative group-hover:bg-n-8 transition-colors">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Typewriter
                            options={{
                              strings: [
                                '$ 10,000 MXN',
                                '$ 15,000 MXN',
                                '$ 20,000 MXN',
                                '$ 25,000 MXN'
                              ],
                              autoStart: true,
                              loop: true,
                              delay: 50,
                              deleteSpeed: 30,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta MercadoLibre (Derecha) - Más pequeña en móvil */}
              <a
                href="https://www.mercadolibre.com.mx"
                target="_blank"
                rel="noopener noreferrer"
                className="marketplace-card block p-4 lg:p-6 rounded-xl bg-n-7 border border-n-1/10 
                  transition-all duration-300 hover:scale-[1.02] hover:bg-n-6 relative overflow-hidden transform-gpu
                  h-[120px] lg:h-auto"
              >
                <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                  <span className="text-2xl lg:text-3xl">🌟</span>
                  <div className="text-xl lg:text-2xl font-bold text-[#FFE600] transition-colors duration-300">
                    MercadoLibre
                  </div>
                </div>
                
                <p className="text-n-3 text-xs lg:text-sm transition-colors duration-300 group-hover:text-n-1">
                  La mayor plataforma de comercio electrónico en México
                </p>
              </a>
            </div>
          </div>

          {/* Beneficios Destacados */}
          <div className="max-w-[40rem] mx-auto">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 rounded-xl bg-n-7/50 backdrop-blur-sm">
                <div className="text-[#33FF57] text-2xl mb-2">⚡️</div>
                <h3 className="text-sm font-semibold mb-1">Respuesta Inmediata</h3>
                <p className="text-xs text-n-3">Conoce tu capacidad de crédito al instante</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-n-7/50 backdrop-blur-sm">
                <div className="text-[#33FF57] text-2xl mb-2">🎯</div>
                <h3 className="text-sm font-semibold mb-1">Planes Flexibles</h3>
                <p className="text-xs text-n-3">Ajustados a tu capacidad de pago</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-n-7/50 backdrop-blur-sm">
                <div className="text-[#33FF57] text-2xl mb-2">🔒</div>
                <h3 className="text-sm font-semibold mb-1">100% Seguro</h3>
                <p className="text-xs text-n-3">Proceso transparente y confiable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="mt-20 py-10 bg-n-8/50 backdrop-blur-sm rounded-2xl">
          <h3 className="text-center text-2xl font-bold mb-8">Confían en nosotros</h3>
          <div className="marquee overflow-hidden relative hover:cursor-pointer">
            <div className="track flex flex-nowrap w-[200%] animate-scroll-logos">
              {/* Primera mitad */}
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
                { src: logoVallealto, alt: "Valle Alto" },
                // Segunda mitad (repetición)
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
                <div key={`logo-${index}`} className="flex-shrink-0 px-4">
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 hover:bg-white/60 transition-all duration-300 hover:scale-105">
                    <img 
                      src={logo.src} 
                      alt={logo.alt}
                      className="h-16 w-[160px] object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Hero;
