import { useState, useEffect } from 'react';
import { getByCode, registerUser } from '../../services/api';
import { FaBuilding, FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Register = ({ onAuthenticated, switchToLogin, initialCompanyCode = '' }) => {
  const [employeeCode, setEmployeeCode] = useState(initialCompanyCode);
  const [firstName, setFirstName] = useState('');
  const [paternalSurname, setPaternalSurname] = useState('');
  const [maternalSurname, setMaternalSurname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');

  // Verificar el código de empresa al cargar o cuando cambie
  useEffect(() => {
    if (employeeCode) {
      validateCompanyCode();
    }
  }, [employeeCode]);

  // Validar código de empresa
  const validateCompanyCode = async () => {
    try {
      setIsLoading(true);
      const companyData = await getByCode(employeeCode);
      setCompanyName(companyData.name);
      setShowCompanyInfo(true);
      setError('');
    } catch (error) {
      setShowCompanyInfo(false);
      setCompanyName('');
      setError('Código de empresa inválido. Por favor verifica.');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Validación de email
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return false;
    }
    setEmailError('');
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

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value.length > 0) {
      validateEmail(value);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar campos antes de enviar
    if (!validatePhone(phone)) {
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    if (!showCompanyInfo) {
      setError('Por favor verifica el código de empresa');
      return;
    }
    
    setIsLoading(true);

    try {
      // Obtener datos de la empresa
      const companyData = await getByCode(employeeCode);
      
      // Crear objeto de usuario
      const userData = {
        first_name: firstName,
        paternal_surname: paternalSurname,
        maternal_surname: maternalSurname,
        birth_date: birthDate,
        phone: phone,
        email: email,
        company_id: companyData.id
      };
      
      // Registrar usuario
      const registeredUser = await registerUser(userData);
      
      // Combinar datos de empresa y usuario para la autenticación
      const authData = {
        ...companyData,
        payment_frequency: paymentFrequency,
        user_data: registeredUser
      };
      
      onAuthenticated(authData);
    } catch (error) {
      setError(error.message || 'Error al registrar usuario');
      console.error('Registration error:', error);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-n-8/80 backdrop-blur-xl border border-n-6 rounded-2xl p-8 shadow-2xl mx-auto mb-12"
    >
      <div className="flex items-center mb-6">
        <button 
          onClick={() => switchToLogin()}
          className="mr-4 text-n-3 hover:text-[#33FF57] transition-colors"
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-2xl font-bold text-center text-[#33FF57] flex-1">
          Registro de Usuario
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Código de Empresa */}
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
          {showCompanyInfo && (
            <p className="text-[#33FF57] text-xs mt-1">Empresa: {companyName}</p>
          )}
        </div>

        {/* Información de Empresa */}
        {showCompanyInfo && (
          <>
            {/* Frecuencia de Pago */}
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

            {/* Nombre */}
            <div className="relative group">
              <label 
                htmlFor="firstName" 
                className="block text-sm font-medium text-n-3 mb-2"
              >
                Nombre(s)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <FaUser className="text-n-4 group-focus-within:text-[#33FF57] transition-colors" />
                </div>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-n-7 text-n-1 border border-n-6 focus:outline-none focus:border-[#33FF57] transition-colors placeholder-n-4/50"
                  placeholder="Ingresa tu nombre"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#33FF57] to-[#33FF57] opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Apellido Paterno */}
            <div className="relative group">
              <label 
                htmlFor="paternalSurname" 
                className="block text-sm font-medium text-n-3 mb-2"
              >
                Apellido Paterno
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <FaUser className="text-n-4 group-focus-within:text-[#33FF57] transition-colors" />
                </div>
                <input
                  type="text"
                  id="paternalSurname"
                  value={paternalSurname}
                  onChange={(e) => setPaternalSurname(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-n-7 text-n-1 border border-n-6 focus:outline-none focus:border-[#33FF57] transition-colors placeholder-n-4/50"
                  placeholder="Ingresa tu apellido paterno"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#33FF57] to-[#33FF57] opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Apellido Materno */}
            <div className="relative group">
              <label 
                htmlFor="maternalSurname" 
                className="block text-sm font-medium text-n-3 mb-2"
              >
                Apellido Materno
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <FaUser className="text-n-4 group-focus-within:text-[#33FF57] transition-colors" />
                </div>
                <input
                  type="text"
                  id="maternalSurname"
                  value={maternalSurname}
                  onChange={(e) => setMaternalSurname(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-n-7 text-n-1 border border-n-6 focus:outline-none focus:border-[#33FF57] transition-colors placeholder-n-4/50"
                  placeholder="Ingresa tu apellido materno"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#33FF57] to-[#33FF57] opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="relative group">
              <label 
                htmlFor="birthDate" 
                className="block text-sm font-medium text-n-3 mb-2"
              >
                Fecha de Nacimiento
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <FaCalendarAlt className="text-n-4 group-focus-within:text-[#33FF57] transition-colors" />
                </div>
                <input
                  type="date"
                  id="birthDate"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-n-7 text-n-1 border border-n-6 focus:outline-none focus:border-[#33FF57] transition-colors"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#33FF57] to-[#33FF57] opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Teléfono */}
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

            {/* Email */}
            <div className="relative group">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-n-3 mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <FaEnvelope className="text-n-4 group-focus-within:text-[#33FF57] transition-colors" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className={`w-full pl-12 pr-4 py-3 rounded-lg bg-n-7 text-n-1 border ${emailError ? 'border-red-500' : 'border-n-6'} focus:outline-none focus:border-[#33FF57] transition-colors placeholder-n-4/50`}
                  placeholder="Ingresa tu correo electrónico"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#33FF57] to-[#33FF57] opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
              </div>
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>
          </>
        )}

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
          disabled={isLoading || !showCompanyInfo}
          className={`
            relative w-full overflow-hidden rounded-xl
            px-6 py-3 text-sm font-medium uppercase tracking-wider
            transition-all duration-300
            ${isLoading || !showCompanyInfo
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
                <span>Procesando...</span>
              </div>
            ) : (
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                REGISTRARME
              </span>
            )}
          </div>
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-n-3 text-xs">
          Al registrarte, aceptas nuestros Términos y Condiciones y Política de Privacidad
        </p>
      </div>
    </motion.div>
  );
};

export default Register; 