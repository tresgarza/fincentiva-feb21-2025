import { useState, useEffect } from 'react';
import Button from "./Button";
import { API_URL } from '../config/api';
import { saveProductSimulation, saveCashRequest, saveSelectedPlan, getCompanyAdvisor } from '../services/supabaseServices';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabase';

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
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [amountToFinance, setAmountToFinance] = useState(0);
  const [amountToReceive, setAmountToReceive] = useState(0);
  const [isLoadingWhatsapp, setIsLoadingWhatsapp] = useState(false);

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Función para calcular el monto a financiar basado en el tipo de producto y la comisión
  const calculateFinancingAmount = () => {
    // Verificar que la comisión esté disponible y sea válida
    let commissionRate = (company.commission_rate || 0) / 100; // Convertir de porcentaje a decimal
    
    // Prevenir valores inválidos
    if (isNaN(commissionRate) || commissionRate < 0) commissionRate = 0;
    if (commissionRate >= 1) commissionRate = 0.99; // Limitamos al 99% como máximo
    
    // Determinar si es producto o crédito en efectivo
    const isPersonalLoan = product.title === "Crédito en Efectivo";
    const originalPrice = parseFloat(product.price) || 0;
    
    console.log('Calculando monto a financiar:', {
      originalPrice: originalPrice,
      commissionRate: commissionRate * 100 + '%',
      isPersonalLoan: isPersonalLoan
    });
    
    let amount = 0;
    let toReceive = 0;
    
    if (isPersonalLoan) {
      // Para créditos en efectivo: El monto a financiar es el solicitado
      amount = originalPrice;
      // El monto a recibir es: Monto solicitado - (Monto solicitado * comisión)
      toReceive = Math.max(0, amount * (1 - commissionRate));
    } else {
      // Para productos: El monto a financiar es: Precio / (1 - comisión)
      if (commissionRate < 1) {
        amount = Math.max(0, originalPrice / (1 - commissionRate));
      } else {
        amount = originalPrice * 2; // Fallback si la comisión es 100% o más
      }
    }
    
    // Evitar valores no válidos
    amount = Math.round(amount * 100) / 100;
    toReceive = Math.round(toReceive * 100) / 100;
    
    console.log('Montos calculados:', {
      amountToFinance: amount,
      amountToReceive: toReceive
    });
    
    setAmountToFinance(amount);
    setAmountToReceive(toReceive);
    
    return amount;
  };

  // Calcular el pago máximo por periodo (25% del ingreso por periodo)
  const calculateMaxPaymentPerPeriod = (period) => {
    const income = company.monthly_income || 0;
    // El ingreso viene en el periodo de la empresa (semanal, quincenal o mensual)
    // Calculamos el 25% del ingreso en ese periodo
    return income * 0.25;
  };

  const maxPaymentPerPeriod = calculateMaxPaymentPerPeriod(selectedPlan?.period);

  // Función para verificar si un plan excede la capacidad de pago
  const exceedsCapacity = (plan) => {
    const maxPayment = calculateMaxPaymentPerPeriod(plan.period);
    return plan.payment_per_period > maxPayment;
  };

  useEffect(() => {
    // Cálculo inicial del monto a financiar cuando se carga el componente
    if (product && company) {
      calculateFinancingAmount();
    }
  }, [product, company]);

  useEffect(() => {
    const calculatePayments = async () => {
      try {
        const financingAmount = calculateFinancingAmount();
        
        const response = await fetch(`${API_URL}/companies/calculate-payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: company.id,
            amount: financingAmount,
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
    // Cargar el advisor asociado a la empresa (solo cuando sea necesario)
    const loadAdvisor = async () => {
      if (company && company.id) {
        console.log('Evaluando si es necesario cargar datos del advisor para:', company.name);
        console.log('Empresa completa:', JSON.stringify(company));
        
        // Si la empresa ya tiene el teléfono del asesor, no es necesario hacer más consultas
        if (company.advisor_phone) {
          console.log('La empresa ya tiene el teléfono del asesor:', company.advisor_phone);
          return;
        }
        
        // Solo cargar el asesor si no está disponible el teléfono directamente
        console.log('Obteniendo datos del advisor para complementar información');
        
        try {
          const result = await getCompanyAdvisor(company.id);
          
          if (result.success && result.data) {
            setAdvisorData(result.data);
            console.log('Advisor obtenido como respaldo:', result.data);
          } else {
            console.warn('No se pudo obtener el advisor como respaldo');
          }
        } catch (error) {
          console.error('Error al cargar el advisor como respaldo:', error);
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

  // Añadir esta función para alternar la expansión de la descripción
  const toggleDescription = (e) => {
    e.stopPropagation(); // Evitar que el click se propague al contenedor
    setExpandedDescription(!expandedDescription);
  };

  // Función para redirigir a WhatsApp
  const redirectToWhatsApp = (phoneNumber, message) => {
    // Asegurarse de que el número tiene el formato correcto para WhatsApp
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
      cleanPhone = `52${cleanPhone}`;
    }
    
    console.log('Redirigiendo a WhatsApp con número:', cleanPhone);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Mostrar notificación de éxito
    showNotification("¡Plan seleccionado correctamente!");
  };

  // Función para verificar si un plan está seleccionado
  const isSelected = (plan) => {
    if (!selectedPlan) return false;
    return selectedPlan.periods === plan.periods && 
           selectedPlan.payment_per_period === plan.payment_per_period;
  };

  // Función para manejar la selección del plan
  const handlePlanSelection = (plan) => {
    // Prevenir selección si el plan está seleccionado o supera capacidad
    if (isSelected(plan) || exceedsCapacity(plan)) {
      return;
    }

    // Establecer el plan seleccionado
    setSelectedPlan(plan);

    // Establecer estados de loading
    setLoadingStep(1);
    setIsLoadingWhatsapp(true);
     
    // Determinar el tipo de simulación basado en el título del producto
    const isPersonalLoan = product.title === "Crédito en Efectivo";
     
    // Información del producto
    const productData = {
      title: product.title,
      imageUrl: product.image,
      originalPrice: parseFloat(product.price),
      financingAmount: amountToFinance,
      commissionRate: company.commission_rate || 0, // Porcentaje de comisión
    };
     
    // Si es un crédito en efectivo, añadir el monto a recibir
    if (isPersonalLoan) {
      productData.amountToReceive = amountToReceive;
    }
     
    // Obtener información del usuario
    const phoneNumber = company.advisor_phone || company.phone_number || localStorage.getItem('user_phone');
    const companyCode = company.code || localStorage.getItem('company_code');
     
    // Verificar si tenemos todos los datos necesarios
    if (!phoneNumber || !companyCode) {
      console.error('Faltan datos del usuario o del código de la empresa');
      setIsLoadingWhatsapp(false);
      showNotification("Error: No se encontró información de contacto", "error");
      return;
    }
     
    console.log('Información del plan seleccionado:', {
      plan,
      product: productData,
      companyInfo: {
        name: company.name,
        phoneNumber,
        companyCode
      }
    });
     
    // Después de un breve delay, actualizar el estado de loading
    setTimeout(() => {
      setLoadingStep(2);
       
      // Preparar los datos a enviar al siguiente paso
      const paymentPlanData = {
        ...plan,
        product: productData,
        user: {
          phone: phoneNumber,
          company_code: companyCode,
          monthly_income: company.monthly_income
        }
      };
       
      // Guardar la selección en el localStorage
      localStorage.setItem('selected_plan', JSON.stringify(paymentPlanData));
       
      // Después de otro breve delay, proceder a WhatsApp
      setTimeout(() => {
        setLoadingStep(3);
         
        // Construir el mensaje para WhatsApp
        const message = constructWhatsAppMessage(plan, product, isPersonalLoan);
         
        // Redirigir a WhatsApp
        redirectToWhatsApp(phoneNumber, message);
         
        // Reiniciar estados
        setTimeout(() => {
          setIsLoadingWhatsapp(false);
          setLoadingStep(0);
        }, 1000);
      }, 1500);
    }, 1500);
  };
  
  // Función para construir el mensaje de WhatsApp
  const constructWhatsAppMessage = (plan, product, isPersonalLoan) => {
    // Mensaje base
    let message = `¡Hola! Estoy interesado en un financiamiento ${company.name}.\n\n`;
    
    // Detalles del financiamiento según el tipo
    if (isPersonalLoan) {
      message += `Crédito en Efectivo por: ${formatCurrency(product.price)}\n`;
      message += `Monto a recibir: ${formatCurrency(amountToReceive)}\n`;
    } else {
      message += `Producto: ${product.title}\n`;
      message += `Precio: ${formatCurrency(product.price)}\n`;
      message += `Monto a financiar: ${formatCurrency(amountToFinance)}\n`;
    }
    
    // Detalles del plan seleccionado
    message += `\nPlan seleccionado:\n`;
    message += `• Plazo: ${plan.periods} ${getPeriodShortLabel(plan.period)}\n`;
    message += `• Pago ${plan.period}: ${formatCurrency(plan.payment_per_period)}\n`;
    message += `• Total a pagar: ${formatCurrency(plan.total_payment)}\n`;
    message += `• CAT: ${plan.cat}%\n\n`;
    
    message += `¿Podría proporcionarme más información sobre este financiamiento? Gracias.`;
    
    return encodeURIComponent(message);
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

  return (
    <div className="relative">
      {/* Loading Popup para WhatsApp */}
      <AnimatePresence>
        {isLoadingWhatsapp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-n-7 rounded-2xl p-6 max-w-sm w-full mx-4"
            >
              <div className="flex flex-col items-center">
                <div className="mb-4 relative w-24 h-24">
                  <svg
                    className="w-24 h-24 text-n-3"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      className="opacity-75"
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#33FF57"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (loadingStep / 3) * 283}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#33FF57]">{Math.round((loadingStep / 3) * 100)}%</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-n-1 mb-2 text-center">
                  {loadingStep === 1 && "Guardando tus preferencias..."}
                  {loadingStep === 2 && "Preparando tu plan de financiamiento..."}
                  {loadingStep === 3 && "Redirigiendo a WhatsApp..."}
                </h3>
                <p className="text-n-3 text-center text-sm">
                  {loadingStep === 1 && "Estamos procesando tu información"}
                  {loadingStep === 2 && "Configurando los detalles de tu plan"}
                  {loadingStep === 3 && "Te conectaremos con un asesor en un momento"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      <div className="flex flex-col items-center gap-1 mb-4">
                        <div className="text-3xl font-bold text-[#33FF57]">
                          {formatCurrency(product.price)}
                        </div>
                        <div className="text-sm text-n-3">
                          Monto solicitado
                        </div>
                        {amountToReceive > 0 && (
                          <div className="mt-2 flex flex-col items-center px-4 py-2 bg-n-6 rounded-lg">
                            <div className="text-lg font-medium text-n-1">
                              {formatCurrency(amountToReceive)}
                            </div>
                            <div className="text-xs text-n-3">
                              Recibirás (después de comisión)
                            </div>
                          </div>
                        )}
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
                        <h2 className="text-2xl font-bold text-n-1 mb-2 text-center">
                          {product.title}
                        </h2>
                        <div className="flex flex-col items-center gap-1 mb-4">
                          <div className="text-3xl font-bold text-[#33FF57]">
                            {formatCurrency(product.price)}
                          </div>
                          <div className="text-sm text-n-3">
                            Precio del producto
                          </div>
                          {amountToFinance > 0 && amountToFinance > parseFloat(product.price) && (
                            <div className="mt-2 flex flex-col items-center px-4 py-2 bg-n-6 rounded-lg">
                              <div className="text-lg font-medium text-n-1">
                                {formatCurrency(amountToFinance)}
                              </div>
                              <div className="text-xs text-n-3">
                                Monto a financiar (incluye comisión)
                              </div>
                            </div>
                          )}
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
                            <div className={expandedDescription ? "h-auto" : "h-[60px] overflow-hidden relative"}>
                              <ul className="list-disc list-inside space-y-0.5 text-xs">
                                {product.features.map((feature, index) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                              {!expandedDescription && product.features.length > 3 && (
                                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-n-7 to-transparent"></div>
                              )}
                            </div>
                            {product.features.length > 3 && (
                              <button 
                                onClick={toggleDescription}
                                className="mt-1 px-2 py-0.5 text-[10px] bg-n-6 hover:bg-n-5 text-n-1 rounded-sm transition-colors"
                              >
                                {expandedDescription ? "Ver menos" : "Ver más"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Financing Options Column */}
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold text-center text-n-1 mb-2">Elige tu Plan de Pagos</h2>
                
                {/* Contenedor para los planes en una sola columna vertical */}
                <div className="flex flex-col gap-2 flex-grow">
                  {/* Ordenar los planes de mayor a menor plazo */}
                  {paymentOptions
                    .sort((a, b) => b.periods - a.periods)
                    .map((plan, index) => {
                      // El plan recomendado es el que tiene más periodos de pago (mayor plazo)
                      const isRecommended = plan.periods === Math.max(...paymentOptions.map(opt => opt.periods));
                      const exceeds = exceedsCapacity(plan);

                      return (
                        <div
                          key={`${plan.periods}-${plan.payment_per_period}`}
                          onClick={() => !exceeds && handlePlanSelection(plan)}
                          className={`relative rounded-2xl p-2 shadow-sm ${
                            isRecommended
                              ? "bg-gradient-to-b from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/10"
                              : "bg-n-2 dark:bg-n-7"
                          } ${!exceeds ? "cursor-pointer hover:shadow-md transition-shadow" : "cursor-not-allowed opacity-80"}`}
                        >
                          {/* Indicadores superiores: clickable y recomendado */}
                          {!exceeds && !isRecommended && (
                            <div className="absolute top-1 right-1">
                              <span className="text-n-3 text-[9px] flex items-center">
                                <svg className="w-2 h-2 mr-0.5" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z"/>
                                  <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
                                </svg>
                                Click para seleccionar
                              </span>
                            </div>
                          )}
                          {isRecommended && !exceeds && (
                            <div className="absolute top-0 left-0 right-0 flex justify-center">
                              <span className="inline-block bg-[#33FF57] text-black text-[10px] font-medium px-2 py-0 rounded-b-sm transform -translate-y-0">
                                Recomendado
                              </span>
                            </div>
                          )}
                          
                          {/* Layout de la tarjeta en dos partes principales - Más compacto */}
                          <div className="grid grid-cols-5 gap-1 mt-4">
                            {/* Columna izquierda (1/5) - Periodos */}
                            <div className="col-span-1 flex flex-col justify-center items-center py-0.5">
                              <h3 className="text-base font-bold text-n-1 leading-tight">
                                {plan.periods}
                              </h3>
                              <span className="text-[10px] text-n-3 leading-tight">
                                {plan.periodLabel}
                              </span>
                            </div>
                            
                            {/* Columna derecha (4/5) - Información de pagos */}
                            <div className="col-span-4 flex flex-col py-0.5">
                              {/* Indicador de selección */}
                              {!exceeds && isRecommended && (
                                <div className="flex justify-end items-center text-[#33FF57] text-[10px] mb-0.5">
                                  <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Seleccionado</span>
                                </div>
                              )}
                              
                              {/* Pago por periodo - Cuadro Rojo */}
                              <div className="text-center">
                                <div className="flex items-baseline justify-center">
                                  <span className={`text-xl font-bold ${exceeds ? 'text-red-500' : 'text-[#33FF57]'} leading-tight`}>
                                    {formatCurrency(plan.paymentPerPeriod)}
                                  </span>
                                  <span className="text-[10px] text-n-3 ml-1">
                                    /{getPeriodShortLabel(plan.periodLabel)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Total a pagar - Cuadro Azul */}
                              <div className="text-center">
                                <div className="flex justify-center items-baseline gap-1">
                                  <span className="text-n-3 text-[9px] leading-tight">Total:</span>
                                  <span className="text-n-1/90 text-[10px] leading-tight">
                                    {formatCurrency(plan.totalPayment)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Mensaje de error si excede capacidad */}
                              {exceeds && (
                                <div className="text-center mt-0.5">
                                  <span className="text-red-500 text-[9px] leading-tight">
                                    Excede capacidad
                                  </span>
                                </div>
                              )}
                            </div>
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