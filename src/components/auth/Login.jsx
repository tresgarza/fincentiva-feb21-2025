import { useState } from 'react';
import { getByCode, getUserByPhone } from '../../services/api';
import Button from '../Button';
import { FaBuilding, FaLock, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Login = ({ onAuthenticated, switchToRegister }) => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validación del teléfono (10 dígitos)
  const validatePhone = (value) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      setPhoneError('El teléfono debe tener 10 dígitos numéricos');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo permitir dígitos
    setPhone(value);
    if (value.length > 0) {
      validatePhone(value);
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPhoneError('');
    
    // Validar teléfono antes de enviar
    if (!validatePhone(phone)) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Obtener datos de la empresa
      const companyData = await getByCode(employeeCode);
      
      // Verificar si el usuario existe para esta empresa
      const userData = await getUserByPhone(phone, companyData.id);
      
      if (!userData) {
        // El usuario no existe, redirigir al registro
        setError('Usuario no encontrado. Por favor regístrate primero.');
        switchToRegister(employeeCode);
        setIsLoading(false);
        return;
      }
      
      // Combinar datos de empresa y usuario
      const authData = {
        ...companyData,
        user_data: userData
      };
      
      onAuthenticated(authData);
    } catch (error) {
      setError(error.message || 'Error al verificar credenciales');
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-n-8/80 backdrop-blur-xl border border-n-6 rounded-2xl p-8 shadow-2xl mx-auto mb-12"
    >
      <h2 className="text-2xl font-bold text-center text-[#33FF57] mb-6">
        Iniciar Sesión
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="relative group">
          <label 
            htmlFor="phone" 
            className="block text-sm font-medium text-n-3 mb-2"
          >
            Teléfono (10 dígitos)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <FaPhone className="text-n-4 group-focus-within:text-[#33FF57] transition-colors" />
            </div>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
              required
              className={`w-full pl-12 pr-4 py-3 rounded-lg bg-n-7 text-n-1 border ${phoneError ? 'border-red-500' : 'border-n-6'} focus:outline-none focus:border-[#33FF57] transition-colors placeholder-n-4/50`}
              placeholder="Ingresa tu número de teléfono"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#33FF57] to-[#33FF57] opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
          </div>
          {phoneError && (
            <p className="text-red-500 text-xs mt-1">{phoneError}</p>
          )}
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

      <div className="text-center mt-6">
        <p className="text-n-3 text-sm">
          ¿No tienes cuenta?{' '}
          <button 
            onClick={() => switchToRegister()}
            className="text-[#33FF57] hover:underline"
          >
            Regístrate
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default Login; 