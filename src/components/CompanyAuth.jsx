import { useState } from 'react';
import { API_URL } from '../config/api';
import { TEST_COMPANIES } from '../config/testCompanies';
import { getCompanies, getByCode } from '../services/api';
import Button from './Button';
import { FaBuilding, FaLock, FaChartLine, FaCreditCard, FaUserTie, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CompanyAuth = ({ onAuthenticated }) => {
  const [companyCode, setCompanyCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Verificar si es una empresa de prueba
      const testCompany = TEST_COMPANIES[companyCode.toUpperCase()];
      if (testCompany) {
        // Simular delay para mejor UX
        await new Promise(resolve => setTimeout(resolve, 500));
        onAuthenticated(testCompany);
        return;
      }

      // Si no es empresa de prueba, intentar con el backend
      const response = await fetch(`${API_URL}/companies/code/${companyCode}`);
      
      if (!response.ok) {
        throw new Error('Error al verificar las credenciales de la empresa');
      }

      const data = await response.json();
      onAuthenticated(data);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: <FaChartLine className="text-[#33FF57]" />,
      title: "Análisis Instantáneo",
      description: "Evaluación inmediata de capacidad crediticia"
    },
    {
      icon: <FaCreditCard className="text-[#40E0D0]" />,
      title: "Financiamiento Flexible",
      description: "Opciones adaptadas a cada empleado"
    },
    {
      icon: <FaUserTie className="text-[#4DE8B2]" />,
      title: "Portal Empresarial",
      description: "Gestión completa de solicitudes"
    },
    {
      icon: <FaShieldAlt className="text-[#3FD494]" />,
      title: "Máxima Seguridad",
      description: "Protección de datos garantizada"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Formulario de Acceso */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <label 
            htmlFor="companyCode" 
            className="block text-sm font-medium text-n-3 mb-2 transition-colors group-focus-within:text-[#33FF57]"
          >
            Código de Empresa
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <FaBuilding className="text-n-4 group-focus-within:text-[#33FF57] transition-colors" />
            </div>
            <input
              type="text"
              id="companyCode"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-n-7 text-n-1 border border-n-6 focus:outline-none focus:border-[#33FF57] transition-colors placeholder-n-4/50"
              placeholder="Ingresa el código de tu empresa"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#33FF57] to-[#33FF57] opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-lg"
          >
            <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
            <div className="relative text-red-500 text-sm px-4 py-2">
              {error}
            </div>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`
            relative w-full overflow-hidden rounded-xl
            px-6 py-3 text-sm font-medium uppercase tracking-wider
            transition-all duration-300
            ${isLoading 
              ? 'bg-n-6 text-n-3 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#33FF57] via-[#40E0D0] to-[#3FD494] text-black hover:shadow-lg hover:shadow-[#33FF57]/20'
            }
            group
          `}
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Verificando...</span>
              </div>
            ) : (
              <>
                <FaLock className="text-black group-hover:rotate-12 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  INICIAR SESIÓN
                </span>
              </>
            )}
          </div>
        </button>
      </form>

      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-n-6"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-n-8 text-n-3">Beneficios de la plataforma</span>
        </div>
      </div>

      {/* Grid de Beneficios */}
      <div className="grid grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-n-7/50 border border-n-6 hover:border-[#33FF57]/50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-n-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-n-1 mb-1">{benefit.title}</h3>
                <p className="text-xs text-n-3">{benefit.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Nota de Seguridad */}
      <div className="text-center">
        <p className="text-xs text-n-3">
          Acceso seguro con encriptación de extremo a extremo
        </p>
      </div>

      <div className="mt-4 text-n-3 text-sm">
        <p className="mb-2">Códigos de prueba disponibles:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>PRUEBA1 - Pago Semanal</li>
          <li>PRUEBA2 - Pago Quincenal</li>
          <li>PRUEBA3 - Pago Mensual</li>
        </ul>
      </div>
    </div>
  );
};

export default CompanyAuth; 