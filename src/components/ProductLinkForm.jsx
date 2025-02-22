import { useState } from "react";
import Button from "./Button";
import Section from "./Section";
import { FaLink, FaMoneyBillWave } from "react-icons/fa";
import { BsArrowRight, BsClipboard, BsCheckCircle } from "react-icons/bs";
import { motion } from "framer-motion";

const ProductLinkForm = ({ onSubmit, isLoading, company, showLoader }) => {
  const [productLink, setProductLink] = useState("");
  const [income, setIncome] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxCredit, setMaxCredit] = useState(null);

  const getPaymentFrequencyLabel = () => {
    switch (company?.payment_frequency) {
      case 'weekly': return 'semana';
      case 'biweekly': return 'quincena';
      case 'fortnightly': return 'catorcena';
      default: return 'mes';
    }
  };

  const calculateMaxCredit = (incomeAmount) => {
    if (!incomeAmount) return null;
    
    // El ingreso está en el periodo de la empresa (semanal, quincenal o mensual)
    // Calculamos el pago máximo por periodo (25% del ingreso)
    const maxPaymentPerPeriod = incomeAmount * 0.25;
    
    // Calculamos el monto máximo de crédito basado en la tasa de interés y el plazo máximo
    const annualRate = company?.interest_rate || 60; // 60% anual por defecto
    
    // Convertimos la tasa anual al periodo correspondiente
    let periodicRate;
    let maxPeriods;
    switch (company?.payment_frequency) {
      case 'weekly':
        periodicRate = annualRate / 100 / 52; // Tasa semanal
        maxPeriods = 52; // 52 semanas (1 año)
        break;
      case 'biweekly':
      case 'fortnightly':
        periodicRate = annualRate / 100 / 26; // Tasa quincenal
        maxPeriods = 26; // 26 quincenas (1 año)
        break;
      default:
        periodicRate = annualRate / 100 / 12; // Tasa mensual
        maxPeriods = 12; // 12 meses (1 año)
    }

    // Fórmula para calcular el monto máximo de préstamo considerando intereses
    // P = PMT * (1 - (1 + r)^-n) / r
    // Donde: P = Principal (monto máximo), PMT = Pago por periodo máximo, r = tasa por periodo, n = número de periodos
    const maxLoan = maxPaymentPerPeriod * (1 - Math.pow(1 + periodicRate, -maxPeriods)) / periodicRate;
    
    // Ajustamos el valor para considerar el IVA sobre intereses (16%)
    const maxLoanWithIVA = maxLoan / (1 + (periodicRate * maxPeriods * 0.16));
    
    // Retornamos el mínimo entre el máximo calculado y 100,000
    return Math.min(Math.floor(maxLoanWithIVA), 100000);
  };

  const validateLink = (url) => {
    try {
      const parsedUrl = new URL(url);
      const validDomains = [
        'amazon.com',
        'amazon.com.mx',
        'mercadolibre.com.mx',
        'mercadolibre.com',
      ];
      
      const isValidDomain = validDomains.some(domain => parsedUrl.hostname.endsWith(domain));
      
      if (!isValidDomain) {
        setError("Por favor ingresa un enlace válido de Amazon México o MercadoLibre México");
        return false;
      }
      
      return true;
    } catch (err) {
      setError("Por favor ingresa una URL válida");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;
    
    if (!validateLink(productLink)) return;
    if (!income) {
      setError("Por favor ingresa tus ingresos");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let monthlyIncome = parseFloat(income);
      switch (company?.payment_frequency) {
        case 'weekly':
          monthlyIncome = monthlyIncome * 4;
          break;
        case 'biweekly':
        case 'fortnightly':
          monthlyIncome = monthlyIncome * 2;
          break;
      }

      await onSubmit(productLink, parseFloat(income), monthlyIncome);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberInput = (e, setter) => {
    let value = e.target.value;
    value = value.replace(/[^\d]/g, '');
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setter(numValue.toString());
      if (setter === setIncome) {
        const calculatedMax = calculateMaxCredit(numValue);
        setMaxCredit(calculatedMax);
      }
    } else if (value === '') {
      setter('');
      if (setter === setIncome) {
        setMaxCredit(null);
      }
    }
    setError("");
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Section id="product-link" className={showLoader ? 'hidden' : 'block'}>
      <div className="container px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center">
          {/* Guía Visual Animada (Izquierda) - Ajustada para móvil */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-[300px] flex flex-col gap-6"
          >
            <div className="flex-1 bg-n-8/50 rounded-xl p-6 border border-n-6">
              <h4 className="text-lg font-semibold mb-4 text-[#33FF57]">Guía Rápida</h4>
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#33FF57]/20 flex items-center justify-center flex-shrink-0">
                    <BsClipboard className="text-[#33FF57]" />
                  </div>
                  <div>
                    <p className="text-sm text-n-1">Copia el enlace del producto que deseas financiar</p>
                    <p className="text-xs text-n-3 mt-1">Asegúrate que sea de Amazon o MercadoLibre México</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#33FF57]/20 flex items-center justify-center flex-shrink-0">
                    <FaMoneyBillWave className="text-[#33FF57]" />
                  </div>
                  <div>
                    <p className="text-sm text-n-1">Indica tus ingresos por {getPaymentFrequencyLabel()}</p>
                    <p className="text-xs text-n-3 mt-1">Esto nos ayuda a calcular tu capacidad de pago</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#33FF57]/20 flex items-center justify-center flex-shrink-0">
                    <BsCheckCircle className="text-[#33FF57]" />
                  </div>
                  <div>
                    <p className="text-sm text-n-1">Obtén tu plan personalizado</p>
                    <p className="text-xs text-n-3 mt-1">Te mostraremos las opciones que mejor se ajusten a ti</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Información Adicional - Visible solo en pantallas grandes */}
            <div className="hidden lg:block bg-n-8/50 rounded-xl p-6 border border-n-6">
              <h4 className="text-lg font-semibold mb-4 text-[#33FF57]">¿Sabías que?</h4>
              <div className="space-y-3 text-sm text-n-3">
                <p>• Puedes financiar cualquier producto elegible de las tiendas participantes</p>
                <p>• El monto máximo de financiamiento depende de tus ingresos</p>
                <p>• Obtienes respuesta inmediata sobre tu capacidad de crédito</p>
              </div>
            </div>
          </motion.div>

          {/* Formulario Principal - Ajustado para móvil */}
          <div className="w-full lg:w-[40rem] flex">
            <div className="relative p-0.5 rounded-2xl bg-gradient-to-r from-[#40E0D0] via-[#4DE8B2] to-[#3FD494] overflow-hidden flex-1">
              <div className="relative bg-[#0D1117] rounded-2xl p-4 sm:p-8 h-full flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center justify-center mb-6 sm:mb-8">
                    <div className="relative">
                      <FaLink className="text-[#40E0D0] text-3xl sm:text-4xl animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[#33FF57] rounded-full animate-ping" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">Comienza tu Compra</h3>
                  
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8">
                    {/* Campo de Ingresos */}
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <label htmlFor="income" className="text-n-4 text-sm">
                        ¿Cuánto ganas por {getPaymentFrequencyLabel()}?
                      </label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-n-4">
                          $
                        </span>
                        <input
                          type="text"
                          id="income"
                          value={income}
                          onChange={(e) => handleNumberInput(e, setIncome)}
                          placeholder="0"
                          className="w-full h-12 px-12 rounded-lg bg-[#1A1F26] text-white placeholder-gray-500 border border-[#2D3643] focus:outline-none focus:border-[#40E0D0] transition-colors text-right pr-20"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-n-4 ml-2">
                          MXN
                        </span>
                      </div>
                    </div>

                    {/* Campo de Enlace del Producto */}
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <label htmlFor="productLink" className="text-n-4 text-sm">
                        Enlace del Producto
                      </label>
                      <div className="relative group">
                        <input
                          type="url"
                          id="productLink"
                          value={productLink}
                          onChange={(e) => setProductLink(e.target.value)}
                          placeholder="https://www.amazon.com.mx/..."
                          className="w-full h-12 px-4 rounded-lg bg-[#1A1F26] text-white placeholder-gray-500 border border-[#2D3643] focus:outline-none focus:border-[#40E0D0] transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Información de Capacidad de Crédito */}
                    {maxCredit && (
                      <div className="mt-4 p-4 bg-[#1A1F26] rounded-lg border border-[#2D3643]">
                        <p className="text-[#40E0D0] font-medium text-sm sm:text-base">
                          Tu capacidad máxima de crédito es de {formatCurrency(maxCredit)}
                        </p>
                        <p className="text-xs mt-1 text-n-3">
                          Basado en el 25% de tus ingresos por {getPaymentFrequencyLabel()}
                        </p>
                      </div>
                    )}

                    {/* Mensajes de Error */}
                    {error && (
                      <div className="relative overflow-hidden rounded-lg mt-4">
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                        <div className="relative text-red-500 text-sm px-4 py-3">
                          {error}
                        </div>
                      </div>
                    )}

                    {/* Botón de Envío */}
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className={`
                        relative overflow-hidden group
                        w-full h-12 sm:h-14 rounded-xl text-sm font-bold mt-6
                        bg-[#33FF57] text-black
                        transition-all duration-300
                        hover:bg-[#40ff63] hover:scale-[1.01]
                        active:scale-[0.99]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        disabled:hover:scale-100 disabled:hover:bg-[#33FF57]
                      `}
                    >
                      {isSubmitting || isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span className="text-black">Procesando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-black">
                          <span className="tracking-wider text-xs sm:text-sm">VER OPCIONES DE FINANCIAMIENTO</span>
                          <svg 
                            className="w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-300 group-hover:translate-x-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M13 7l5 5m0 0l-5 5m5-5H6" 
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional - Visible solo en pantallas pequeñas */}
          <div className="block lg:hidden bg-n-8/50 rounded-xl p-6 border border-n-6 mt-6">
            <h4 className="text-lg font-semibold mb-4 text-[#33FF57]">¿Sabías que?</h4>
            <div className="space-y-3 text-sm text-n-3">
              <p>• Puedes financiar cualquier producto elegible de las tiendas participantes</p>
              <p>• El monto máximo de financiamiento depende de tus ingresos</p>
              <p>• Obtienes respuesta inmediata sobre tu capacidad de crédito</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Section>
  );
};

export default ProductLinkForm; 