import { useState, useEffect } from 'react';
import Button from "./Button";
import { API_URL } from '../config/api';
import { saveProductSimulation, saveCashRequest, saveSelectedPlan, getCompanyAdvisor } from '../services/supabaseServices';
import { motion, AnimatePresence } from 'framer-motion';

const FinancingOptions = ({ product, company, onSelectPlan, onBack, onLoaded }) => {
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [simulationId, setSimulationId] = useState(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [advisorData, setAdvisorData] = useState(null);

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Calcular el pago máximo por periodo (25% del ingreso por periodo)
  const calculateMaxPaymentPerPeriod = () => {
    const income = company.monthly_income || 0;
    // El ingreso viene en el periodo de la empresa (semanal, quincenal o mensual)
    // Calculamos el 25% del ingreso en ese periodo
    return income * 0.25;
  };

  const maxPaymentPerPeriod = calculateMaxPaymentPerPeriod();

  // Verificar si un plan excede la capacidad de pago
  const exceedsPaymentCapacity = (paymentPerPeriod, periodLabel) => {
    // Si el periodo del plan es diferente al periodo de la empresa, convertir
    const planPeriod = periodLabel; // 'semanas', 'quincenas', 'meses'
    const companyPeriod = company.payment_frequency; // 'weekly', 'biweekly', 'monthly'

    // Convertir el pago del plan al periodo de la empresa
    let adjustedPayment = paymentPerPeriod;

    // Convertir el pago del plan al periodo de la empresa
    if (companyPeriod === 'weekly') {
      if (planPeriod === 'quincenas') {
        adjustedPayment = paymentPerPeriod / 2; // De quincenal a semanal
      } else if (planPeriod === 'meses') {
        adjustedPayment = paymentPerPeriod / 4; // De mensual a semanal
      }
    } else if (companyPeriod === 'biweekly') {
      if (planPeriod === 'semanas') {
        adjustedPayment = paymentPerPeriod * 2; // De semanal a quincenal
      } else if (planPeriod === 'meses') {
        adjustedPayment = paymentPerPeriod / 2; // De mensual a quincenal
      }
    } else { // monthly
      if (planPeriod === 'semanas') {
        adjustedPayment = paymentPerPeriod * 4; // De semanal a mensual
      } else if (planPeriod === 'quincenas') {
        adjustedPayment = paymentPerPeriod * 2; // De quincenal a mensual
      }
    }

    // Comparamos el pago ajustado con el máximo permitido para el periodo de la empresa
    // Agregamos un margen de tolerancia del 1% para evitar problemas de redondeo
    const exceeds = adjustedPayment > (maxPaymentPerPeriod * 1.01);
    
    console.log('Debugging payment capacity:', {
      paymentPerPeriod,
      periodLabel,
      companyPeriod,
      adjustedPayment,
      maxPaymentPerPeriod,
      income: company.monthly_income,
      exceeds
    });
    
    return exceeds;
  };

  useEffect(() => {
    const calculatePayments = async () => {
      try {
        const response = await fetch(`${API_URL}/companies/calculate-payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: company.id,
            amount: product.price,
            monthlyIncome: company.monthly_income,
            paymentFrequency: company.payment_frequency
          })
        });

        if (!response.ok) {
          throw new Error('Error al calcular las opciones de pago');
        }

        const data = await response.json();
        setPaymentOptions(data);
        
        // Guardar la simulación en Supabase
        await saveSimulation(data);
        
        // Llamamos a onLoaded cuando los planes estén listos
        onLoaded?.();
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        // También llamamos a onLoaded en caso de error
        onLoaded?.();
      } finally {
        setIsLoading(false);
      }
    };

    calculatePayments();
  }, [product, company, onLoaded]);

  useEffect(() => {
    // Cargar el advisor asociado a la empresa
    const loadAdvisor = async () => {
      if (company && company.id) {
        try {
          const result = await getCompanyAdvisor(company.id);
          if (result.success && result.data) {
            setAdvisorData(result.data);
            console.log('Advisor asociado a la empresa:', result.data);
          } else {
            console.warn('No se pudo obtener el advisor asociado a la empresa:', result.error);
          }
        } catch (error) {
          console.error('Error al cargar el advisor:', error);
        }
      }
    };

    loadAdvisor();
  }, [company]);

  // Función para guardar la simulación en Supabase según el tipo
  const saveSimulation = async (plans) => {
    try {
      // Obtener datos del usuario desde company o localStorage
      let userData = company.user_data || {};
      
      // Si no hay datos de usuario en company, intentar obtenerlos desde localStorage
      if (!userData.phone) {
        const storedCompanyData = JSON.parse(localStorage.getItem('companyData') || '{}');
        if (storedCompanyData.user_data) {
          userData = {
            ...userData,
            ...storedCompanyData.user_data
          };
        }
      }
      
      // Log para depurar
      console.log('Datos del usuario en saveSimulation:', userData);
      console.log('Teléfono del usuario:', userData.phone);
      
      // Obtener el código de la empresa, preferiblemente del campo employee_code
      let companyCode = company.employee_code;
      
      // Si no hay código en el objeto company, intentar obtenerlo del localStorage
      if (!companyCode) {
        const storedCompanyData = JSON.parse(localStorage.getItem('companyData') || '{}');
        companyCode = storedCompanyData.employee_code || storedCompanyData.code;
        
        // Si aún no tenemos código, usar el ID como último recurso
        if (!companyCode) {
          companyCode = company.id || "COMPANY-" + Math.floor(Math.random() * 1000);
          console.log('Advertencia: Usando ID o valor generado como código de empresa');
        }
      }
      
      // Determinar si es una simulación de producto o una solicitud de efectivo
      const isProductSimulation = product.title !== "Crédito en Efectivo";
      console.log('Tipo de simulación:', isProductSimulation ? 'Producto' : 'Efectivo');
      
      // Datos comunes para ambos tipos de simulación
      const commonData = {
        user_first_name: userData.firstName || '',
        user_last_name: userData.lastName || '',
        user_phone: userData.phone || '',
        company_id: company.id,
        company_name: company.name,
        company_code: companyCode,
        user_income: parseFloat(company.monthly_income),
        payment_frequency: company.payment_frequency,
        monthly_income: parseFloat(company.monthly_income),
        recommended_plans: plans
      };
      
      console.log('Datos comunes a enviar:', commonData);
      
      let result;
      
      if (isProductSimulation) {
        // Simulación de producto
        result = await saveProductSimulation({
          ...commonData,
          product_url: product.url || '',
          product_title: product.title,
          product_price: parseFloat(product.price)
        });
      } else {
        // Solicitud de efectivo
        result = await saveCashRequest({
          ...commonData,
          requested_amount: parseFloat(product.price)
        });
      }
      
      console.log('Resultado de guardar simulación:', result);
      
      if (result.success && result.data && result.data.length > 0) {
        setSimulationId(result.data[0].id);
        showNotification("¡Simulación guardada exitosamente!");
        return result.data[0].id;
      } else {
        console.error('Error al guardar simulación:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error al guardar simulación:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-n-1 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Calculando opciones de pago...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>{error}</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getPeriodShortLabel = (periodLabel) => {
    switch (periodLabel) {
      case 'semanas': return 'sem';
      case 'quincenas': return 'qna';
      case 'catorcenas': return 'cat';
      default: return 'mes';
    }
  };

  const handlePlanSelection = async () => {
    if (!selectedPlan || !simulationId || isSavingPlan) return;
    
    setIsSavingPlan(true);
    setShowLoadingPopup(true);
    
    try {
      // Configurar animación por pasos
      let stepCount = 0;
      const stepInterval = setInterval(() => {
        stepCount++;
        setLoadingStep(stepCount);
        if (stepCount >= 3) clearInterval(stepInterval);
      }, 1000);

      // Determine simulation type
      const simulationType = product.title === "Crédito en Efectivo" ? 'cash' : 'product';
      console.log('Tipo de simulación en handlePlanSelection:', simulationType);
      
      // Preparar datos adicionales del producto
      const productData = {};
      if (simulationType === 'product' && product) {
        productData.product_url = product.url || '';
        productData.product_title = product.title || '';
        productData.product_price = parseFloat(product.price) || 0;
        productData.product_image = product.image || '';
      } else if (simulationType === 'cash') {
        productData.requested_amount = parseFloat(product.price) || 0;
      }
      
      // Obtener datos del usuario desde company o localStorage
      let userData = company.user_data || {};
      
      // Si no hay datos de usuario en company, intentar obtenerlos desde localStorage
      if (!userData.phone) {
        const storedCompanyData = JSON.parse(localStorage.getItem('companyData') || '{}');
        if (storedCompanyData.user_data) {
          userData = {
            ...userData,
            ...storedCompanyData.user_data
          };
        }
      }
      
      console.log('Datos del usuario en handlePlanSelection:', userData);
      console.log('Teléfono del usuario en handlePlanSelection:', userData.phone);
      
      // Obtener el código de la empresa
      let companyCode = company.employee_code;
      if (!companyCode) {
        const storedCompanyData = JSON.parse(localStorage.getItem('companyData') || '{}');
        companyCode = storedCompanyData.employee_code || storedCompanyData.code;
        if (!companyCode) {
          companyCode = company.id || "COMPANY-" + Math.floor(Math.random() * 1000);
        }
      }
      
      // Save selected plan to Supabase
      const planData = {
        simulation_id: simulationId,
        simulation_type: simulationType,
        periods: selectedPlan.periods,
        period_label: selectedPlan.periodLabel,
        payment_per_period: selectedPlan.paymentPerPeriod,
        total_payment: selectedPlan.totalPayment,
        interest_rate: selectedPlan.interestRate,
        // Datos de la empresa
        company_id: company.id,
        company_name: company.name,
        company_code: companyCode,
        // Datos del usuario
        user_first_name: userData.firstName || '',
        user_last_name: userData.lastName || '',
        user_phone: userData.phone || '',
        // Datos del producto
        ...productData
      };
      
      console.log('Datos del plan a guardar:', planData);
      
      const result = await saveSelectedPlan(planData);
      console.log('Resultado de guardar plan seleccionado:', result);
      
      // Construir el mensaje con la información del plan
      let message = `¡Hola! 👋

Me interesa solicitar un financiamiento con las siguientes características:

*Datos del Producto:*
📱 Producto: ${product.title}
💰 Precio: ${formatCurrency(product.price)}`;

      // Añadir enlace del producto si existe
      if (product.url && product.title !== "Crédito en Efectivo") {
        message += `
🔗 Enlace: ${product.url}`;
      }

      message += `

*Plan de Financiamiento Seleccionado:*
🏢 Empresa: ${company.name}
⏱️ Plazo: ${selectedPlan.periods} ${selectedPlan.periodLabel}
💳 Pago por ${selectedPlan.periodLabel}: ${formatCurrency(selectedPlan.paymentPerPeriod)}
💵 Total a pagar: ${formatCurrency(selectedPlan.totalPayment)}
📊 Tasa de interés: ${selectedPlan.interestRate}% anual

*Datos de Contacto:*
👤 Nombre: ${userData.firstName} ${userData.lastName}
📞 Teléfono: ${userData.phone || 'No proporcionado'}

Me gustaría recibir más información sobre el proceso de solicitud.
¡Gracias!`;

      // Esperar a que la animación termine (mínimo 3 segundos)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Codificar el mensaje para URL
      const encodedMessage = encodeURIComponent(message);
      
      // Obtener el número de teléfono del advisor o usar el número por defecto
      let phoneNumber = '5218116364522'; // Número por defecto
      
      if (advisorData && advisorData.phone) {
        // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
        const cleanPhone = advisorData.phone.replace(/\D/g, '');
        // Asegurarse de que tiene el formato correcto para WhatsApp
        phoneNumber = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
        // Asegurarse de que si ya tiene 10 dígitos, se le agregue el prefijo 52
        if (cleanPhone.length === 10) {
          phoneNumber = `52${cleanPhone}`;
        }
        console.log('Usando número de teléfono del advisor:', phoneNumber);
      } else {
        console.warn('No se encontró el advisor asociado a la empresa, usando número por defecto');
      }
      
      // Redirigir a WhatsApp con el número del advisor o el predeterminado
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
      
      showNotification("¡Plan seleccionado correctamente!");
    } catch (error) {
      console.error('Error al guardar el plan seleccionado:', error);
      showNotification("Hubo un error al guardar el plan seleccionado", "error");
    } finally {
      setIsSavingPlan(false);
      setShowLoadingPopup(false);
    }
  };

  return (
    <div className="w-full px-3 py-1">
      {/* Notificación */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-5 right-5 z-50 rounded-lg shadow-lg px-4 py-2 ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Popup */}
      <AnimatePresence>
        {showLoadingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-n-7 rounded-xl border border-n-6 p-6 shadow-lg max-w-md w-full mx-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-4">
                  <svg className="animate-spin w-full h-full" viewBox="0 0 50 50">
                    <circle
                      className="stroke-[#40E0D0]"
                      strokeWidth="2"
                      fill="none"
                      r="20"
                      cx="25"
                      cy="25"
                      strokeDasharray="89, 200"
                      strokeDashoffset="0"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-lg">
                    {Math.min(Math.round((loadingStep / 3) * 100), 100)}%
                  </div>
                </div>
                
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#40E0D0] to-[#3FD494] mb-2">
                  Procesando tu solicitud
                </h3>
                
                <div className="space-y-2 text-n-3">
                  <p className={loadingStep >= 1 ? "text-white" : ""}>
                    {loadingStep >= 1 ? "✓ " : ""}Guardando tus preferencias...
                  </p>
                  <p className={loadingStep >= 2 ? "text-white" : ""}>
                    {loadingStep >= 2 ? "✓ " : ""}Preparando tu plan de financiamiento...
                  </p>
                  <p className={loadingStep >= 3 ? "text-white" : ""}>
                    {loadingStep >= 3 ? "✓ " : ""}¡Listo para redireccionar a WhatsApp!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative p-0.5 rounded-lg bg-gradient-to-r from-[#40E0D0] via-[#4DE8B2] to-[#3FD494] overflow-hidden max-w-[720px] mx-auto">
        <div className="relative bg-n-8 rounded-lg p-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Product Info Column */}
            <div className="bg-n-7 rounded-lg p-3">
              <div className="flex flex-col gap-2">
                {product.title === "Crédito en Efectivo" ? (
                  <div className="flex flex-col items-center">
                    <div className="w-[120px] h-[120px] relative mb-4">
                      {/* Círculo exterior animado */}
                      <div className="absolute inset-0 rounded-full border-4 border-[#40E0D0] animate-spin-slow"></div>
                      {/* Círculo interior con gradiente */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#40E0D0] to-[#3FD494] flex items-center justify-center">
                        <div className="text-4xl">💰</div>
                      </div>
                      {/* Partículas flotantes */}
                      <div className="absolute inset-0">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-[#40E0D0] rounded-full animate-float"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              animationDelay: `${i * 0.5}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-n-1 mb-2 text-center">
                      {product.title}
                    </h2>
                    <div className="text-3xl font-bold text-[#33FF57] mb-4">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="w-full space-y-3">
                      <div className="bg-n-6 rounded-lg p-3">
                        <h3 className="text-n-1 font-semibold mb-2">Beneficios del Crédito</h3>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-n-3">
                              <span className="mr-2">✨</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-n-6 rounded-lg p-3">
                        <h3 className="text-n-1 font-semibold mb-2">Información Importante</h3>
                        <ul className="space-y-2 text-sm text-n-3">
                          <li className="flex items-center">
                            <span className="mr-2">📅</span>
                            Aprobación rápida
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">🏦</span>
                            Depósito inmediato
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">📝</span>
                            Sin papeleos excesivos
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="aspect-square w-full max-w-[120px] mx-auto rounded-md overflow-hidden bg-n-6">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-n-1 mb-1.5">{product.title}</h2>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl font-bold text-[#33FF57]">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                        {product.rating && (
                          <div className="text-n-3 text-xs">
                            <span className="font-medium text-n-1">Calificación:</span> {product.rating}
                          </div>
                        )}
                        {product.availability && (
                          <div className="text-n-3 text-xs">
                            <span className="font-medium text-n-1">Disponibilidad:</span> {product.availability}
                          </div>
                        )}
                      </div>
                      {product.features && product.features.length > 0 && (
                        <div className="text-n-3">
                          <h3 className="text-sm font-semibold text-n-1 mb-0.5">Características</h3>
                          <ul className="list-disc list-inside space-y-0.5 text-xs">
                            {product.features.map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Financing Options Column */}
            <div className="flex flex-col h-full">
              <h2 className="text-lg font-bold text-center text-n-1 mb-2">Elige tu Plan de Financiamiento</h2>
              <div className="flex flex-col gap-1.5 flex-grow">
                {paymentOptions.map((option, index) => {
                  const isSelected = selectedPlan === option;
                  const exceeds = exceedsPaymentCapacity(option.paymentPerPeriod, option.periodLabel);
                  
                  return (
                    <div
                      key={option.periods}
                      onClick={() => !exceeds && setSelectedPlan(option)}
                      className={`
                        relative bg-n-7 rounded-md p-2 
                        ${exceeds ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.005] hover:shadow-sm hover:shadow-n-1/5'}
                        transition-all duration-300 ease-in-out
                        ${isSelected && !exceeds
                          ? 'ring-1 ring-[#33FF57] shadow-sm shadow-[#33FF57]/20 scale-[1.01]' 
                          : ''}
                      `}
                    >
                      {/* Recommended Badge */}
                      {index === 0 && !exceeds && (
                        <span className="absolute top-2 right-2 inline-flex items-center bg-[#33FF57]/10 text-[#33FF57] text-[9px] px-1.5 py-0.5 rounded-sm">
                          <svg className="w-2 h-2 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Recomendado
                        </span>
                      )}

                      {/* Excede capacidad Badge */}
                      {exceeds && (
                        <span className="absolute top-2 right-2 inline-flex items-center bg-red-500/10 text-red-500 text-[9px] px-1.5 py-0.5 rounded-sm">
                          <svg className="w-2 h-2 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Excede capacidad de pago
                        </span>
                      )}

                      <div className="flex flex-col">
                        {/* Period Header */}
                        <div className="mb-0.5">
                          <h3 className="text-sm font-bold text-n-1">
                            {option.periods} {option.periodLabel}
                          </h3>
                        </div>

                        {/* Details Grid */}
                        <div className="border-t border-n-6 pt-1.5">
                          {/* Monthly Payment - Main Focus */}
                          <div className="flex items-baseline justify-center mb-1.5">
                            <span className={`text-2xl font-bold ${exceeds ? 'text-red-500' : 'text-[#33FF57]'}`}>
                              {formatCurrency(option.paymentPerPeriod)}
                            </span>
                            <span className="text-xs text-n-3 ml-1">
                              /{getPeriodShortLabel(option.periodLabel)}
                            </span>
                          </div>

                          {/* Total and Interest Rate in 2 columns */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="text-center">
                              <span className="text-n-3 text-[10px] block mb-0.5">Total a pagar</span>
                              <span className="text-n-1 font-medium text-[10px]">
                                {formatCurrency(option.totalPayment)}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="text-n-3 text-[10px] block mb-0.5">Tasa de interés</span>
                              <span className="text-n-1 text-[10px]">
                                {option.interestRate}% anual
                              </span>
                            </div>
                          </div>

                          {exceeds && (
                            <div className="mt-2 text-[10px] text-red-500 text-center">
                              La mensualidad excede el 25% de tus ingresos
                            </div>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        <div className={`
                          h-0.5 w-full rounded-full mt-1.5
                          transition-all duration-300 ease-in-out
                          ${isSelected && !exceeds ? 'bg-[#33FF57]' : 'bg-n-6'}
                        `} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-2 gap-1.5">
                <Button
                  className="px-3 py-1 text-xs bg-n-7 hover:bg-n-6 transition-colors"
                  onClick={onBack}
                >
                  Regresar
                </Button>
                <Button
                  className={`
                    px-3 py-1 text-xs bg-n-7 hover:bg-n-6 transition-colors
                    ${!selectedPlan ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={!selectedPlan}
                  onClick={handlePlanSelection}
                >
                  <span className="flex items-center gap-1.5">
                    {selectedPlan ? (
                      <>
                        Continuar con Plan Seleccionado
                        <svg 
                          className="w-4 h-4" 
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
                      </>
                    ) : (
                      'Selecciona un Plan'
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FinancingOptions; 