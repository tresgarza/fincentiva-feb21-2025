import { useState, useEffect } from 'react';
import Button from "./Button";
import { API_URL } from '../config/api';
import { saveProductSimulation, saveCashRequest, saveSelectedPlan, getCompanyAdvisor, updateCashRequestNetAmount } from '../services/supabaseServices';
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
  const [financingAmount, setFinancingAmount] = useState(0);

  // Calcular el monto a financiar (con comisión incluida)
  const calculateFinancingAmount = () => {
    // Convertir la comisión a decimal (5.00 -> 0.05)
    const commissionRate = (company.commission_rate || 0) / 100;
    
    if (product.title === "Crédito Personal") {
      // Para créditos personales: monto solicitado (la comisión se mostrará como deducción)
      return product.price;
    } else {
      // Para productos: precio / (1 - comisión)
      // Añadir verificación para evitar división por cero o valores negativos
      if (commissionRate >= 1) {
        console.error('Tasa de comisión inválida (≥100%):', company.commission_rate);
        return product.price * 1.05; // Valor por defecto razonable (5% de comisión)
      }
      
      const calculated = commissionRate > 0 
        ? Math.round(product.price / (1 - commissionRate) * 100) / 100
        : product.price;
      
      // Verificación adicional para asegurar que el resultado es válido
      if (isNaN(calculated) || calculated <= 0) {
        console.error('Cálculo de monto inválido:', calculated, 'usando valor por defecto');
        return product.price * 1.05; // Valor por defecto razonable (5% de comisión)
      }
      
      return calculated;
    }
  };

  // Calcular la comisión para créditos personales (monto solicitado * comisión)
  const calculatePersonalLoanCommission = () => {
    const rate = company.commission_rate || 0;
    const amount = parseFloat(product.price);
    return (rate / 100) * amount;
  };

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
    // Calcular el monto a financiar cuando cambie el producto o la empresa
    console.log('Datos de la empresa recibidos en FinancingOptions:', company);
    console.log('Tasa de comisión recibida:', company.commission_rate);
    
    // Asignar una tasa de comisión por defecto si no existe
    if (company.commission_rate === undefined || company.commission_rate === null) {
      console.log('Comisión no definida, asignando valor por defecto de 5%');
      company.commission_rate = 5;
    }
    
    const amount = calculateFinancingAmount();
    console.log('Monto calculado para financiar:', amount);
    setFinancingAmount(amount);
    
    // Calcular y registrar montos de comisión para mejor seguimiento
    const commissionRate = company.commission_rate / 100;
    console.log('Tasa de comisión en decimal:', commissionRate);
    
    if (product.title === "Crédito Personal") {
      // Para créditos personales
      const commissionAmount = Math.round(product.price * commissionRate * 100) / 100;
      const netAmount = product.price - commissionAmount;
      console.log('Crédito Personal - Monto solicitado:', product.price);
      console.log('Crédito Personal - Comisión calculada:', commissionAmount);
      console.log('Crédito Personal - Monto neto a recibir:', netAmount);
    } else {
      // Para productos
      const originalPrice = product.price;
      const financingAmount = amount;
      const commissionAmount = Math.round((financingAmount - originalPrice) * 100) / 100;
      console.log('Producto - Precio original:', originalPrice);
      console.log('Producto - Monto a financiar:', financingAmount);
      console.log('Producto - Comisión calculada:', commissionAmount);
      console.log('Producto - Porcentaje efectivo de comisión:', ((commissionAmount / originalPrice) * 100).toFixed(2) + '%');
    }

    const calculatePayments = async () => {
      try {
        // Usar el monto a financiar (con comisión incluida) para calcular los pagos
        const response = await fetch(`${API_URL}/companies/calculate-payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: company.id,
            amount: amount, // Monto a financiar con comisión
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
        
        // Hacer scroll al inicio cuando los planes estén listos
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
        // Llamamos a onLoaded cuando los planes estén listos
        onLoaded?.();
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        
        // Hacer scroll al inicio incluso en caso de error
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
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
      const isProductSimulation = product.title !== "Crédito Personal";
      console.log('Tipo de simulación:', isProductSimulation ? 'Producto' : 'Efectivo');
      
      // Calcular montos de comisión
      const commissionRate = company.commission_rate || 0;
      let commissionAmount = 0;
      let netAmount = 0;
      let financing_amount = 0;
      
      // Construir el nombre completo del cliente utilizando todos los datos disponibles
      let clientName = '';
      if (userData.first_name) {
        clientName = userData.first_name;
        if (userData.paternal_surname) {
          clientName += ' ' + userData.paternal_surname;
        }
        if (userData.maternal_surname) {
          clientName += ' ' + userData.maternal_surname;
        }
      } else if (userData.firstName) {
        clientName = userData.firstName;
        if (userData.lastName) {
          clientName += ' ' + userData.lastName;
        }
      }
      
      // Obtener el email del usuario
      const clientEmail = userData.email || '';
      
      // Datos comunes para ambos tipos de simulación
      const commonData = {
        user_first_name: userData.firstName || userData.first_name || '',
        user_last_name: userData.lastName || (userData.paternal_surname ? `${userData.paternal_surname} ${userData.maternal_surname || ''}` : '') || '',
        user_phone: userData.phone || '',
        client_name: clientName,
        client_email: clientEmail,
        client_phone: userData.phone || '',
        company_id: company.id,
        company_name: company.name,
        company_code: companyCode,
        user_income: parseFloat(company.monthly_income),
        payment_frequency: company.payment_frequency,
        monthly_income: parseFloat(company.monthly_income),
        recommended_plans: plans,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        is_preauthorized: true
      };
      
      console.log('Datos del cliente a guardar en la base de datos:');
      console.log('client_name:', commonData.client_name);
      console.log('client_email:', commonData.client_email);
      console.log('client_phone:', commonData.client_phone);
      
      if (isProductSimulation) {
        // Para productos, la comisión se calcula como la diferencia entre el monto financiado y el precio original
        // Asegurarse de que financingAmount tiene un valor y es mayor que 0
        const calculatedFinancingAmount = financingAmount > 0 ? financingAmount : calculateFinancingAmount();
        
        // Verificación adicional para depuración
        console.log('Valor actual de financingAmount:', financingAmount);
        console.log('Valor calculado de financingAmount:', calculatedFinancingAmount);
        
        // Usar el valor calculado si financingAmount es 0
        const finalFinancingAmount = calculatedFinancingAmount;
        
        // Calcular comisión correctamente
        commissionAmount = Math.max(0, finalFinancingAmount - parseFloat(product.price));
        
        // Actualizar financingAmount solo si es necesario
        if (financingAmount <= 0) {
          setFinancingAmount(finalFinancingAmount);
        }
        
        // Asignar valores al objeto commonData
        commonData.commission_amount = commissionAmount;
        commonData.financing_amount = finalFinancingAmount;
        financing_amount = finalFinancingAmount;
        
        console.log('Precio del producto:', parseFloat(product.price));
        console.log('Monto de financiamiento a guardar:', finalFinancingAmount);
        console.log('Monto de comisión a guardar:', commissionAmount);
      } else {
        // Para crédito personal, la comisión se deduce del monto solicitado
        commissionAmount = calculatePersonalLoanCommission();
        netAmount = parseFloat(product.price) - commissionAmount;
        
        // Actualizar el commonData con los valores correctos para crédito personal
        commonData.commission_amount = commissionAmount;
      }
      
      console.log('Datos comunes a enviar:', commonData);
      
      let result;
      
      if (isProductSimulation) {
        // Simulación de producto
        result = await saveProductSimulation({
          ...commonData,
          product_url: product.url || '',
          product_title: product.title,
          product_price: parseFloat(product.price),
          financing_amount: financing_amount
        });
      } else {
        // Solicitud de efectivo
        console.log('======== DEBUG SIMULACIÓN CRÉDITO PERSONAL ========');
        console.log('Datos para guardar solicitud de efectivo:');
        console.log('- Monto solicitado:', parseFloat(product.price));
        console.log('- Comisión:', commissionAmount);
        console.log('- Monto neto:', netAmount);
        
        const cashRequestData = {
          ...commonData,
          requested_amount: parseFloat(product.price),
          net_amount: netAmount
        };
        
        result = await saveCashRequest(cashRequestData);
        
        console.log('Resultado de guardar solicitud de efectivo:', result);
        if (result.success && result.data && result.data.length > 0) {
          console.log('ID de simulación de crédito personal guardada:', result.data[0].id);
        } else {
          console.error('Error al guardar simulación de crédito personal:', result.error);
        }
      }
      
      console.log('Resultado de guardar simulación:', result);
      
      if (result.success && result.data && result.data.length > 0) {
        console.log('Estableciendo simulationId:', result.data[0].id, 'para tipo:', isProductSimulation ? 'producto' : 'efectivo');
        
        // Asignar el ID de simulación generado
        const newSimulationId = result.data[0].id;
        setSimulationId(newSimulationId);
        
        // Para crédito personal, guardar también en localStorage como respaldo
        if (!isProductSimulation) {
          try {
            const backupData = {
              simulationId: newSimulationId,
              timestamp: new Date().toISOString(),
              type: 'cash'
            };
            localStorage.setItem('lastCashSimulationId', JSON.stringify(backupData));
            console.log('ID de simulación de crédito personal guardado en localStorage:', backupData);
          } catch (err) {
            console.warn('No se pudo guardar ID de simulación en localStorage:', err);
          }
        }
        
        showNotification("¡Simulación guardada exitosamente!");
        return newSimulationId;
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
    if (!selectedPlan || isSavingPlan) return;
    
    // Log adicional para depuración de crédito personal
    console.log('============== DEBUG SELECCIÓN DE PLAN ==============');
    console.log('Iniciando selección de plan. Datos clave:');
    console.log('- Plan seleccionado:', selectedPlan);
    console.log('- ID de simulación actual:', simulationId);
    console.log('- Tipo de producto:', product.title);
    console.log('- Es crédito personal:', product.title === "Crédito Personal");
    
    // Si no hay un ID de simulación pero es crédito personal, intentar recuperarlo de localStorage
    let currentSimulationId = simulationId;
    const isPersonalLoan = product.title === "Crédito Personal";
    
    if (!currentSimulationId && isPersonalLoan) {
      try {
        const storedData = JSON.parse(localStorage.getItem('lastCashSimulationId') || '{}');
        if (storedData.simulationId) {
          console.log('Recuperando ID de simulación de crédito personal desde localStorage:', storedData);
          currentSimulationId = storedData.simulationId;
        }
      } catch (err) {
        console.warn('Error al intentar recuperar simulationId de localStorage:', err);
      }
    }
    
    // Verificar nuevamente si tenemos un ID de simulación
    if (!currentSimulationId) {
      console.error('Error: No hay ID de simulación disponible. Guardando nueva simulación...');
      
      // Intentar guardar la simulación nuevamente y obtener el ID
      if (paymentOptions && paymentOptions.length > 0) {
        currentSimulationId = await saveSimulation(paymentOptions);
        console.log('Nueva simulación guardada con ID:', currentSimulationId);
      }
      
      // Si aún no hay ID, mostrar error y salir
      if (!currentSimulationId) {
        showNotification("Error: No se pudo guardar la simulación", "error");
        return;
      }
    }
    
    console.log('Usando ID de simulación para guardar plan:', currentSimulationId);
    
    setIsSavingPlan(true);
    setShowLoadingPopup(true);
    
    try {
      // Verificación y log de información de la empresa
      console.log('Información completa de la empresa:', JSON.stringify(company));
      console.log('Teléfono del asesor en la empresa:', company.advisor_phone);
      
      // Configurar animación por pasos
      let stepCount = 0;
      const stepInterval = setInterval(() => {
        stepCount++;
        setLoadingStep(stepCount);
        if (stepCount >= 3) clearInterval(stepInterval);
      }, 1000);

      // Determine simulation type
      const simulationType = isPersonalLoan ? 'cash' : 'product';
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
      
      // Construir el nombre completo del cliente
      let clientName = '';
      if (userData.first_name) {
        clientName = userData.first_name;
        if (userData.paternal_surname) {
          clientName += ' ' + userData.paternal_surname;
        }
        if (userData.maternal_surname) {
          clientName += ' ' + userData.maternal_surname;
        }
      } else if (userData.firstName) {
        clientName = userData.firstName;
        if (userData.lastName) {
          clientName += ' ' + userData.lastName;
        }
      }
      
      // Obtener el email del usuario
      const clientEmail = userData.email || '';
      
      // Save selected plan to Supabase
      const planData = {
        simulation_id: currentSimulationId,
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
        user_first_name: userData.firstName || userData.first_name || '',
        user_last_name: userData.lastName || (userData.paternal_surname ? `${userData.paternal_surname} ${userData.maternal_surname || ''}` : '') || '',
        user_phone: userData.phone || '',
        client_name: clientName,
        client_email: clientEmail,
        client_phone: userData.phone || '',
        // Datos del producto
        ...productData,
        // Información de comisión y financiamiento
        commission_rate: company.commission_rate || 0,
        is_preauthorized: true
      };
      
      console.log('Datos del cliente a guardar en el plan:');
      console.log('client_name:', planData.client_name);
      console.log('client_email:', planData.client_email);
      console.log('client_phone:', planData.client_phone);
      
      // Calcular montos para comisión y financiamiento según el tipo de plan
      if (simulationType === 'product') {
        // Para productos, el monto financiado incluye la comisión
        // Asegurarse de que financingAmount tiene un valor y es mayor que 0
        const calculatedFinancingAmount = financingAmount > 0 ? financingAmount : calculateFinancingAmount();
        
        // Usar el valor calculado
        planData.financing_amount = calculatedFinancingAmount;
        
        // Calcular comisión correctamente
        planData.commission_amount = Math.max(0, calculatedFinancingAmount - parseFloat(product.price));
        
        console.log('PlanSelection - Precio del producto:', parseFloat(product.price));
        console.log('PlanSelection - Monto de financiamiento a guardar:', calculatedFinancingAmount);
        console.log('PlanSelection - Monto de comisión a guardar:', planData.commission_amount);
      } else {
        // Para crédito personal, la comisión se deduce del monto solicitado
        const commissionAmount = calculatePersonalLoanCommission();
        planData.commission_amount = commissionAmount;
        
        // Calcular el monto neto que recibirá el usuario (el valor de "Recibirás")
        const netAmount = parseFloat(product.price) - commissionAmount;
        
        // Guardar el monto neto en financing_amount para crédito personal
        planData.financing_amount = netAmount;
        
        // Logs adicionales para crédito personal
        console.log('PlanSelection (Crédito Personal) - Monto solicitado:', parseFloat(product.price));
        console.log('PlanSelection (Crédito Personal) - Comisión:', commissionAmount);
        console.log('PlanSelection (Crédito Personal) - Monto neto (Recibirás):', netAmount);
        console.log('PlanSelection (Crédito Personal) - ID Simulación:', currentSimulationId);
      }
      
      console.log('Datos del plan a guardar:', planData);
      
      // Debug detallado antes de guardar
      console.log('Estado justo antes de llamar a saveSelectedPlan:');
      console.log('- simulationId presente:', !!currentSimulationId);
      console.log('- simulation_type:', planData.simulation_type);
      console.log('- Campos requeridos completos:', 
        !!planData.simulation_id && 
        !!planData.simulation_type && 
        !!planData.company_id);
      
      // Validar que todos los campos requeridos estén presentes
      if (!planData.simulation_id) {
        const errorMsg = "Error: No se pudo guardar el plan porque falta el ID de simulación";
        console.error(errorMsg);
        showNotification(errorMsg, "error");
        setIsSavingPlan(false);
        setShowLoadingPopup(false);
        return;
      }
      
      try {
        const result = await saveSelectedPlan(planData);
        console.log('Resultado de guardar plan seleccionado:', result);
        
        // Verificar resultado específicamente para crédito personal
        if (simulationType === 'cash') {
          console.log('Resultado específico para crédito personal:', result);
          if (!result.success) {
            console.error('Error específico para crédito personal:', result.error);
            throw new Error(`Error al guardar plan para crédito personal: ${result.error}`);
          }
          
          // Si es crédito personal y se guardó correctamente, actualizar el monto neto en cash_requests
          const netAmount = parseFloat(product.price) - calculatePersonalLoanCommission();
          console.log('Actualizando monto neto en cash_requests:', netAmount);
          
          const updateNetResult = await updateCashRequestNetAmount(currentSimulationId, netAmount);
          if (!updateNetResult.success) {
            console.warn('No se pudo actualizar el monto neto en cash_requests:', updateNetResult.error);
            // No lanzamos error aquí para no interrumpir el flujo principal
          } else {
            console.log('Monto neto actualizado correctamente en cash_requests');
          }
        }

        // Construir el mensaje con la información del plan
        let message = `¡Hola! 👋

Me interesa solicitar un crédito con las siguientes características:

*Datos del Producto:*
📱 Producto: ${product.title}`;

        // Para productos, mostrar tanto el precio original como el monto a financiar con comisión
        if (product.title !== "Crédito Personal") {
          message += `
💰 Precio original: ${formatCurrency(product.price)}`;
          
          if (company.commission_rate > 0) {
            message += `
💵 Monto a financiar (incluye comisión ${company.commission_rate}%): ${formatCurrency(financingAmount)}`;
          }
        } else {
          // Para crédito personal mostrar el monto solicitado, la comisión y el monto neto a recibir
          const commissionAmount = calculatePersonalLoanCommission();
          const netAmount = parseFloat(product.price) - commissionAmount;
          
          message += `
💰 Monto solicitado: ${formatCurrency(product.price)}`;
          
          if (company.commission_rate > 0) {
            message += `
💸 Comisión (${company.commission_rate}%): ${formatCurrency(commissionAmount)}
💵 Monto neto a recibir: ${formatCurrency(netAmount)}`;
          }
        }

        // Añadir enlace del producto si existe
        if (product.url && product.title !== "Crédito Personal") {
          message += `
🔗 Enlace: ${product.url}`;
        }

        message += `

*Plan de Financiamiento Seleccionado:*
🏢 Empresa: ${company.name}
⏱️ Plazo: ${selectedPlan.periods} ${selectedPlan.periodLabel}
💳 Pago por ${selectedPlan.periodLabel}: ${formatCurrency(selectedPlan.paymentPerPeriod)}
💵 Total a pagar: ${formatCurrency(selectedPlan.totalPayment)}


*Datos de Contacto:*
👤 Nombre: ${getFormattedUserName()}
📞 Teléfono: ${userData.phone || 'No proporcionado'}

Me gustaría recibir más información sobre el proceso de solicitud.

⚠️ *ACLARACIÓN IMPORTANTE*: Entiendo que la aprobación mostrada es pre-autorizada. Acepto que esto es una simulación y que el crédito final puede variar, sujeto a verificación por parte de Financiera Incentiva y el área administrativa de mi empresa.
¡Gracias!`;

        // Esperar a que la animación termine (mínimo 3 segundos)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Codificar el mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Obtener el número de teléfono del asesor directamente de la empresa
        let phoneNumber = '5218116364522'; // Número por defecto - Diego Garza
        
        // Verificamos y logueamos la información del teléfono
        console.log('Verificando teléfono del asesor para empresa:', company.name);
        console.log('Teléfono guardado en la empresa:', company.advisor_phone);
        
        // Usar directamente el teléfono de la empresa si está disponible
        if (company.advisor_phone) {
          // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
          const cleanPhone = company.advisor_phone.replace(/\D/g, '');
          
          // Asegurarse de que tiene el formato correcto para WhatsApp
          if (cleanPhone.startsWith('52')) {
            phoneNumber = cleanPhone;
          } else if (cleanPhone.length === 10) {
            phoneNumber = `52${cleanPhone}`;
          } else {
            phoneNumber = `52${cleanPhone}`;
          }
          
          console.log('Usando número de teléfono del advisor asignado a la empresa:', phoneNumber);
        } else if (advisorData && advisorData.phone) {
          // Como respaldo, usar el teléfono del advisor obtenido de la consulta
          const cleanPhone = advisorData.phone.replace(/\D/g, '');
          
          if (cleanPhone.startsWith('52')) {
            phoneNumber = cleanPhone;
          } else if (cleanPhone.length === 10) {
            phoneNumber = `52${cleanPhone}`;
          } else {
            phoneNumber = `52${cleanPhone}`;
          }
          
          console.log('Usando número de teléfono del advisor obtenido por consulta:', phoneNumber);
        } else {
          console.warn('No se encontró teléfono del asesor, usando número por defecto o específico');
          
          // Mapeo de códigos de empresa a números de teléfono como último respaldo
          const companyCodeToPhoneMap = {
            'CAD0227': '5218113800021', // Alexis Medina - CADTONER
            'CAR5799': '5218211110095', // Angelica Elizondo - Taquería "Tía Carmen"
            'TRA5976': '5218211110095', // Angelica Elizondo - Transportes
            'PRE2030': '5218211110095', // Angelica Elizondo - Presidencia
            'RAQ3329': '5218211110095', // Angelica Elizondo - Doña Raquel
            'CAR9424': '5218117919076', // Edgar Benavides - Cartotec
            'GSL9775': '5218116364522',  // Diego Garza - Industrias GSL
            // Agregar otros mapeos específicos según sea necesario
            'HOW1234': '5218120007707'   // Sofía Esparza - Grupo Hower
          };
          
          // Buscar por código de empresa como último respaldo
          if (company.employee_code && companyCodeToPhoneMap[company.employee_code]) {
            phoneNumber = companyCodeToPhoneMap[company.employee_code];
            console.log('Usando número específico para código de empresa:', company.employee_code, phoneNumber);
          } else {
            // Si todo lo demás falla, intentamos buscar coincidencias parciales en el nombre de la empresa
            const companyNameKeywords = {
              'Hower': '5218120007707',   // Sofía Esparza
              'Sofia': '5218120007707',   // Sofía Esparza
              'Carmen': '5218211110095',  // Angelica Elizondo
              'CADTONER': '5218113800021' // Alexis Medina
            };
            
            for (const keyword in companyNameKeywords) {
              if (company.name && company.name.includes(keyword)) {
                phoneNumber = companyNameKeywords[keyword];
                console.log('Coincidencia por palabra clave en nombre:', keyword, phoneNumber);
                break;
              }
            }
          }
        }
        
        // Redirigir a WhatsApp con el número del advisor
        console.log('Abriendo WhatsApp con el número:', phoneNumber);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        
        showNotification("¡Plan seleccionado correctamente!");
      } catch (error) {
        console.error('Error al guardar el plan seleccionado:', error);
        showNotification("Hubo un error al guardar el plan seleccionado", "error");
      } finally {
        setIsSavingPlan(false);
        setShowLoadingPopup(false);
      }
    } catch (error) {
      console.error('Error al guardar el plan seleccionado:', error);
      showNotification("Hubo un error al guardar el plan seleccionado", "error");
    }
  };

  // Función para obtener el nombre del usuario formateado correctamente
  const getFormattedUserName = () => {
    // Si tenemos firstName y lastName, usarlos
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    
    // Si tenemos first_name y apellidos
    if (userData.first_name) {
      let fullName = userData.first_name;
      if (userData.paternal_surname) {
        fullName += ` ${userData.paternal_surname}`;
      }
      if (userData.maternal_surname) {
        fullName += ` ${userData.maternal_surname}`;
      }
      return fullName;
    }
    
    // Si tenemos un client_name almacenado
    if (userData.client_name) {
      return userData.client_name;
    }
    
    // Si hay un nombre completo en el objeto usuario
    if (userData.fullName) {
      return userData.fullName;
    }
    
    // Verificar si hay nombre en el objeto company
    if (company.user_data && company.user_data.firstName) {
      return `${company.user_data.firstName} ${company.user_data.lastName || ''}`;
    }
    
    // Como último recurso, devolver un valor por defecto
    return 'Cliente';
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
                {product.title === "Crédito Personal" ? (
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
                    <div className="text-3xl font-bold text-[#33FF57] mb-1">
                      {formatCurrency(product.price)}
                    </div>
                    
                    {/* Información de comisión para crédito personal */}
                    {company.commission_rate > 0 && (
                      <div className="bg-[#1A1F26] border border-[#2D3643] rounded-md p-3 mb-4 text-sm w-full">
                        <h3 className="text-n-1 font-semibold mb-1 text-center">Detalles del crédito</h3>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-n-3">Monto solicitado:</span>
                            <span className="text-white font-medium">{formatCurrency(product.price)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-red-400">Comisión ({company.commission_rate}%):</span>
                            <span className="text-red-400 font-medium">- {formatCurrency(calculatePersonalLoanCommission())}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-[#2D3643] mt-1 pt-1">
                            <span className="text-n-1 font-medium">Recibirás:</span>
                            <span className="text-[#33FF57] font-bold">{formatCurrency(product.price - calculatePersonalLoanCommission())}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
                      
                      {/* Mostrar precio original y monto a financiar */}
                      <div className="bg-[#1A1F26] border border-[#2D3643] rounded-md p-3 mb-3 w-full">
                        <h3 className="text-n-1 font-semibold mb-1 text-center text-sm">Detalles del financiamiento</h3>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-n-3 text-sm">Precio del producto:</span>
                            <span className="text-white font-medium text-sm">{formatCurrency(product.price)}</span>
                          </div>
                          
                          {company.commission_rate > 0 && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-n-3 text-sm">Comisión ({company.commission_rate}%):</span>
                                <span className="text-yellow-400 font-medium text-sm">
                                  {formatCurrency(financingAmount - product.price)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center border-t border-[#2D3643] mt-1 pt-1">
                                <span className="text-n-1 font-medium text-sm">Monto a financiar:</span>
                                <span className="text-[#33FF57] font-bold text-sm">{formatCurrency(financingAmount)}</span>
                              </div>
                            </>
                          )}
                        </div>
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
              
              {/* Mensaje de pre-autorización */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-2 mb-3">
                <p className="text-center text-xs text-blue-300">
                  <span className="font-medium">Nota:</span> Las opciones mostradas son <span className="font-semibold">pre-autorizadas</span> y están sujetas a verificación final por parte de Financiera Incentiva.
                </p>
              </div>
              
              {/* Contenedor para los planes en una sola columna vertical */}
              <div className="flex flex-col gap-2 flex-grow">
                {/* Ordenar los planes de mayor a menor plazo */}
                {[...paymentOptions].sort((a, b) => b.periods - a.periods).map((option, index) => {
                  const isSelected = selectedPlan === option;
                  const exceeds = exceedsPaymentCapacity(option.paymentPerPeriod, option.periodLabel);
                  
                  // El plan recomendado es el que tiene más periodos de pago (mayor plazo)
                  const isRecommended = option.periods === Math.max(...paymentOptions.map(opt => opt.periods));
                  
                  return (
                    <div
                      key={option.periods}
                      onClick={() => !exceeds && setSelectedPlan(option)}
                      className={`
                        relative bg-n-7 rounded-md p-2 
                        ${exceeds ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01] hover:shadow-md hover:shadow-[#33FF57]/20 hover:border-[#33FF57]/30 hover:border'}
                        transition-all duration-200 ease-in-out
                        ${isSelected && !exceeds
                          ? 'ring-1 ring-[#33FF57] shadow-sm shadow-[#33FF57]/20 scale-[1.01]' 
                          : ''}
                      `}
                    >
                      {/* Indicadores superiores: clickable y recomendado */}
                      {!isSelected && !exceeds && (
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
                      
                      {/* Indicador de pre-autorización */}
                      <div className="absolute top-1 left-1">
                        <span className="text-blue-300 text-[9px] flex items-center">
                          <svg className="w-2 h-2 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Pre-autorizado
                        </span>
                      </div>
                      
                      {/* Layout de la tarjeta en dos partes principales - Más compacto */}
                      <div className="grid grid-cols-5 gap-1 mt-4">
                        {/* Columna izquierda (1/5) - Periodos */}
                        <div className="col-span-1 flex flex-col justify-center items-center py-0.5">
                          <h3 className="text-base font-bold text-n-1 leading-tight">
                            {option.periods}
                          </h3>
                          <span className="text-[10px] text-n-3 leading-tight">
                            {option.periodLabel}
                          </span>
                        </div>

                        {/* Columna derecha (4/5) - Información de pagos */}
                        <div className="col-span-4 flex flex-col py-0.5">
                          {/* Indicador de selección */}
                          {isSelected && !exceeds && (
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
                              {formatCurrency(option.paymentPerPeriod)}
                            </span>
                              <span className="text-[10px] text-n-3 ml-1">
                              /{getPeriodShortLabel(option.periodLabel)}
                            </span>
                            </div>
                          </div>

                          {/* Total a pagar - Cuadro Azul */}
                            <div className="text-center">
                            <div className="flex justify-center items-baseline gap-1">
                              <span className="text-n-3 text-[9px] leading-tight">Total:</span>
                              <span className="text-n-1/90 text-[10px] leading-tight">
                                {formatCurrency(option.totalPayment)}
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