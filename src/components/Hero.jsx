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
import ProductLinkForm from "./ProductLinkForm";
import CreditAmountForm from "./CreditAmountForm";
import FinancingOptions from "./FinancingOptions";
import { AnimatePresence, motion } from 'framer-motion';
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

const Hero = ({ 
  activeForm, 
  setActiveForm, 
  showFinancingOptions, 
  handleProductSubmit, 
  handleAmountSubmit, 
  isLoading, 
  companyData, 
  showLoader,
  productData,
  monthlyIncome,
  handlePlanSelection,
  handleBack,
  setShowLoader,
  setIsLoading
}) => {
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
      className="pt-8"
      crosses
      crossesOffset="lg:translate-y-[5.25rem]"
      customPaddings
      id="hero"
    >
      {/* Loader Global */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-n-8/90 backdrop-blur-sm"
          >
            <div className="relative mb-4">
              <div className="w-16 md:w-20 h-16 md:h-20 border-4 border-[#33FF57] rounded-full animate-spin border-t-transparent"></div>
              <div className="w-12 md:w-16 h-12 md:h-16 border-4 border-[#40E0D0] rounded-full animate-spin-slow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-t-transparent"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 md:w-4 h-3 md:h-4 bg-[#33FF57] rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center px-4">
              <p className="text-n-1 text-base md:text-lg font-medium mb-2">Calculando tus opciones de financiamiento</p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-[#33FF57] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-[#33FF57] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#33FF57] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={parallaxRef} className="container relative">
        <div className="relative z-1 max-w-[120rem] mx-auto mb-1">
          <h1 className="h2 mb-0 mt-8 md:mt-8">
            <div className="h-[60px] md:h-[90px] flex items-center justify-center text-base md:text-4xl">
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
                    pauseFor: 2500,
                    wrapperClassName: 'text-center px-4'
                  }}
                />
              </div>
            </h1>
          <p className="body-2 max-w-[52rem] mx-auto mb-1 text-n-2 text-center text-sm md:text-base hidden md:block">
              Descubre cuánto puedes solicitar según tus ingresos y elige el plan<br className="hidden md:block"/>
              de pagos que mejor se adapte a tu presupuesto. Sin complicaciones, 100% en línea.<br className="hidden md:block"/>
          </p>
        </div>

        {/* Botones de selección con tamaño ajustado en móvil */}
        <div className="flex justify-center gap-2 md:gap-4 mb-4">
          <button
            onClick={() => setActiveForm('product')}
            className={`px-4 md:px-12 py-2 rounded-lg text-sm md:text-base transition-all duration-300 ${
              activeForm === 'product'
                ? 'bg-[#33FF57] text-black'
                : 'bg-n-7 text-n-1 hover:bg-n-6'
            }`}
          >
            Financiar Producto
          </button>
          <button
            onClick={() => setActiveForm('amount')}
            className={`px-4 md:px-12 py-2 rounded-lg text-sm md:text-base transition-all duration-300 ${
              activeForm === 'amount'
                ? 'bg-[#33FF57] text-black'
                : 'bg-n-7 text-n-1 hover:bg-n-6'
            }`}
          >
            Solicitar Efectivo
          </button>
        </div>
              
        {/* Grid container con diseño responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_4fr_2fr] gap-0 lg:gap-8 items-start">
          {/* Columna Izquierda - Oculta en móvil */}
          <div className="hidden lg:block bg-n-6/50 rounded-lg p-4">
            <h4 className="text-xl font-semibold mb-4 text-n-1">Financiar un Producto</h4>
            <ol className="text-sm text-n-3 space-y-3">
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

            {/* Links de marketplaces - Ocultos en móvil */}
            <div className="mt-6 space-y-4">
              <a
                href="https://www.amazon.com.mx"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl bg-n-7 border border-n-1/10 transition-all duration-300 hover:scale-[1.02] hover:bg-n-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🛍️</span>
                  <div className="text-xl font-bold text-[#FF9900]">Amazon</div>
                </div>
                <p className="text-n-3 text-xs">Millones de productos con envío rápido y garantizado</p>
              </a>

              <a
                href="https://www.mercadolibre.com.mx"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl bg-n-7 border border-n-1/10 transition-all duration-300 hover:scale-[1.02] hover:bg-n-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🌟</span>
                  <div className="text-xl font-bold text-[#FFE600]">MercadoLibre</div>
                </div>
                <p className="text-n-3 text-xs">La mayor plataforma de comercio electrónico en México</p>
              </a>
            </div>
          </div>

          {/* Columna Central - Simulador */}
          <div className="flex justify-center w-full px-2 md:px-4">
            {!showFinancingOptions ? (
              <>
                {activeForm === 'product' ? (
                  <ProductLinkForm 
                    onSubmit={handleProductSubmit}
                    isLoading={isLoading}
                    company={companyData}
                    showLoader={showLoader}
                  />
                ) : (
                  <CreditAmountForm
                    onSubmit={handleAmountSubmit}
                    isLoading={isLoading}
                    company={companyData}
                    showLoader={showLoader}
                  />
                )}
              </>
            ) : (
              <FinancingOptions
                product={productData}
                company={{...companyData, monthly_income: monthlyIncome}}
                onSelectPlan={handlePlanSelection}
                onBack={handleBack}
                onLoaded={() => {
                  setShowLoader(false);
                  setIsLoading(false);
                }}
              />
            )}
          </div>

          {/* Columna Derecha - Oculta en móvil */}
          <div className="hidden lg:block bg-n-6/50 rounded-lg p-4">
            <h4 className="text-xl font-semibold mb-4 text-n-1">Solicitar Efectivo</h4>
            <ol className="text-sm text-n-3 space-y-3">
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

            <div className="mt-6 p-4 bg-n-7 rounded-lg border border-n-6">
              <h5 className="text-lg font-semibold mb-3 text-[#33FF57]">Beneficios</h5>
              <ul className="space-y-2 text-sm text-n-3">
                <li className="flex items-center gap-2">
                  <span>💰</span>
                  <span>Hasta $100,000 MXN</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Respuesta inmediata</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🏦</span>
                  <span>Depósito directo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Plazos flexibles</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trusted By Section - Ajustado para móvil */}
        <div className="mt-4 md:mt-12 py-6 md:py-10 bg-n-8/50 backdrop-blur-sm rounded-2xl">
          <h3 className="text-center text-xl md:text-2xl font-bold mb-6 md:mb-8">Confían en nosotros</h3>
          <div className="marquee overflow-hidden relative hover:cursor-pointer">
            <div className="track flex flex-nowrap w-[200%] animate-scroll-logos">
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
