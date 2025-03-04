import { useState } from 'react';
import { getCompanies, getByCode } from '../services/api';
import Button from './Button';
import { FaBuilding, FaLock, FaChartLine, FaCreditCard, FaUserTie, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';

const CompanyAuth = ({ onAuthenticated }) => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const companyData = await getByCode(employeeCode);
      // Agregar la frecuencia de pago seleccionada a los datos de la empresa
      const companyWithFrequency = {
        ...companyData,
        payment_frequency: paymentFrequency
      };
      onAuthenticated(companyWithFrequency);
    } catch (error) {
      setError(error.message || 'Error al verificar credenciales');
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const frequencyOptions = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'fortnightly', label: 'Catorcenal' },
    { value: 'biweekly', label: 'Quincenal' },
    { value: 'monthly', label: 'Mensual' }
  ];

  const benefits = [
    {
      icon: <FaChartLine className="text-[#33FF57]" />,
      title: "Gestión Simplificada",
      description: "Control total sobre las solicitudes de financiamiento de tus empleados desde un solo lugar."
    },
    {
      icon: <FaCreditCard className="text-[#40E0D0]" />,
      title: "Pagos Flexibles",
      description: "Opciones de pago adaptadas a las necesidades y capacidades de cada empleado."
    },
    {
      icon: <FaUserTie className="text-[#4DE8B2]" />,
      title: "Respuesta Inmediata",
      description: "Aprobación instantánea y cálculo automático de capacidad crediticia en tiempo real."
    },
    {
      icon: <FaShieldAlt className="text-[#3FD494]" />,
      title: "Máxima Seguridad",
      description: "Protección de datos y transacciones con los más altos estándares de seguridad."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-n-8 via-n-8/95 to-n-8/90 z-0" />
        
        {/* Animated Circles */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#33FF57]/10 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#40E0D0]/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-[#4DE8B2]/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(51,255,87,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(51,255,87,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-[1200px] w-full mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#33FF57] mb-4">
            Fincentiva
          </h1>
          <div className="h-[30px] text-2xl text-white mb-4">
            <Typewriter
              options={{
                strings: [
                  'Financia tus compras al instante',
                  'Obtén crédito pre-aprobado',
                  'Gestiona tus pagos sin complicaciones',
                  'Accede a beneficios exclusivos',
                  'Crece con respaldo financiero'
                ],
                autoStart: true,
                loop: true,
                deleteSpeed: 30,
                delay: 80,
                pauseFor: 1500,
              }}
            />
          </div>
          <p className="text-n-3 text-lg max-w-2xl mx-auto">
            Plataforma empresarial de financiamiento que permite
            adquirir productos y servicios con facilidades de pago
          </p>
        </div>

        {/* Portal Empresarial Card - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-n-8/80 backdrop-blur-xl border border-n-6 rounded-2xl p-8 shadow-2xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold text-center text-[#33FF57] mb-6">
            Portal Empresarial
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nuevo campo de frecuencia de pago */}
            <div className="relative group">
              <label 
                htmlFor="paymentFrequency" 
                className="block text-sm font-medium text-n-3 mb-2"
              >
                ¿Cómo recibes tu nómina?
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <FaCalendarAlt className="text-n-4 group-focus-within:text-[#33FF57] transition-colors" />
                </div>
                <select
                  id="paymentFrequency"
                  value={paymentFrequency}
                  onChange={(e) => setPaymentFrequency(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-n-7 text-n-1 border border-n-6 focus:outline-none focus:border-[#33FF57] transition-colors appearance-none"
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="fill-current h-4 w-4 text-n-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#33FF57] to-[#33FF57] opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            <div className="relative group">
              <label 
                htmlFor="employeeCode" 
                className="block text-sm font-medium text-n-3 mb-2"
              >
                Código de Empresa
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <FaBuilding className="text-n-4 group-focus-within:text-[#33FF57] transition-colors" />
                </div>
                <input
                  type="text"
                  id="employeeCode"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
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

          {/* Nota de Seguridad */}
          <div className="text-center mt-6">
            <p className="text-xs text-n-3">
              Acceso seguro con encriptación de extremo a extremo
            </p>
          </div>
        </motion.div>

        {/* Beneficios de la plataforma - Horizontal Layout */}
        <div className="w-full max-w-[1200px] px-4">
          <h3 className="text-center text-sm text-n-3 mb-6">
            Beneficios de la plataforma
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-n-7/50 border border-n-6 hover:border-[#33FF57]/50 transition-colors group backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
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
        </div>
      </div>

      {/* Add styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default CompanyAuth; 