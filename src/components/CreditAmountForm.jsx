import { useState } from "react";
import Button from "./Button";
import Section from "./Section";
import { FaMoneyBillWave } from "react-icons/fa";
import { BsClipboard, BsCheckCircle } from "react-icons/bs";
import { motion } from "framer-motion";

const CreditAmountForm = ({ onSubmit, isLoading, company, showLoader }) => {
  const [income, setIncome] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [maxCredit, setMaxCredit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateAmount = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError("Por favor ingresa un monto válido");
      return false;
    }
    if (numValue < 1000) {
      setError("El monto mínimo es de $1,000 MXN");
      return false;
    }
    if (numValue > 100000) {
      setError("El monto máximo es de $100,000 MXN");
      return false;
    }
    if (maxCredit && numValue > maxCredit) {
      setError(`El monto excede tu capacidad de pago máxima de ${formatCurrency(maxCredit)}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    if (!income) {
      setError("Por favor ingresa primero tus ingresos");
      return;
    }

    if (!validateAmount(amount)) return;

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(parseFloat(amount), parseFloat(income));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <Section id="credit-amount" className={showLoader ? 'hidden' : 'block'}>
      <div className="container">
        <div className="relative p-1 rounded-xl bg-gradient-to-r from-[#40E0D0] via-[#4DE8B2] to-[#3FD494] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0" 
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'translateX(-100%)',
                animation: 'gradient-slide 3s linear infinite'
              }}
            />
          </div>

          <div className="relative bg-[#0D1117] rounded-xl p-6 lg:p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <FaMoneyBillWave className="text-[#40E0D0] text-2xl lg:text-3xl animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-[#33FF57] rounded-full animate-ping" />
              </div>
            </div>
            
            <h3 className="text-xl lg:text-2xl font-bold mb-2 text-center">Solicita tu Efectivo</h3>
            <p className="text-sm text-n-4 mb-4 text-center">
              Ingresa tus datos para calcular tu mensualidad
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Campo de Ingresos */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="income" className="text-n-4 text-sm">
                  ¿Cuánto ganas por {getPaymentFrequencyLabel()}?
                </label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-n-4">
                    $
                  </span>
                  <input
                    type="text"
                    id="income"
                    value={income}
                    onChange={(e) => handleNumberInput(e, setIncome)}
                    placeholder="0"
                    className="w-full px-8 py-2.5 rounded-lg bg-[#1A1F26] text-white placeholder-gray-500 border border-[#2D3643] focus:outline-none focus:border-[#40E0D0] transition-colors text-right pr-16 text-sm"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-n-4 text-sm">
                    MXN
                  </span>
                </div>
              </div>

              {/* Campo de Monto Deseado */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="amount" className="text-n-4 text-sm">
                  ¿Cuánto efectivo necesitas?
                </label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-n-4">
                    $
                  </span>
                  <input
                    type="text"
                    id="amount"
                    value={amount}
                    onChange={(e) => handleNumberInput(e, setAmount)}
                    placeholder="0"
                    className="w-full px-8 py-2.5 rounded-lg bg-[#1A1F26] text-white placeholder-gray-500 border border-[#2D3643] focus:outline-none focus:border-[#40E0D0] transition-colors text-right pr-16 text-sm"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-n-4 text-sm">
                    MXN
                  </span>
                </div>
              </div>

              <div className="text-center text-sm text-gray-400">
                {maxCredit ? (
                  <div className="p-2.5 bg-[#1A1F26] rounded-lg border border-[#2D3643]">
                    <p className="text-[#40E0D0] font-medium text-sm">
                      Tu capacidad máxima de crédito es de {formatCurrency(maxCredit)}
                    </p>
                    <p className="text-xs mt-0.5">
                      Basado en el 25% de tus ingresos por {getPaymentFrequencyLabel()}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                   
                    <div className="flex flex-col gap-1.5">
                     
                    
                      <div className="flex items-center gap-1.5">
                        
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                  <div className="relative text-red-500 text-sm px-3 py-1.5">
                    {error}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`
                  relative overflow-hidden group
                  w-full py-2.5 rounded-lg text-sm font-bold mt-0
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
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-black">Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-black">
                    <span className="tracking-wider text-xs">VER OPCIONES DE FINANCIAMIENTO</span>
                    <svg 
                      className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
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

      <style jsx>{`
        @keyframes gradient-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Section>
  );
};

export default CreditAmountForm; 