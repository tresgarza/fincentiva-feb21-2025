import { supabase } from '../config/supabase';

/**
 * Guarda una simulación de financiamiento de producto en Supabase
 * @param {Object} simulationData - Datos de la simulación
 * @returns {Promise<Object>} - Objeto con el resultado de la operación
 */
export const saveProductSimulation = async (simulationData) => {
  try {
    const { data, error } = await supabase
      .from('product_simulations')
      .insert([simulationData])
      .select();

    if (error) throw error;
    
    // Guardar los datos del cliente en la tabla applications
    if (data && data.length > 0) {
      await saveToApplicationsTable({
        simulation_id: data[0].id,
        simulation_type: 'product',
        client_name: simulationData.client_name,
        client_email: simulationData.client_email,
        client_phone: simulationData.client_phone,
        status: 'Simulación',
        company_id: simulationData.company_id,
        company_name: simulationData.company_name
      });
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error al guardar la simulación de producto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Guarda una solicitud de efectivo en Supabase
 * @param {Object} requestData - Datos de la solicitud
 * @returns {Promise<Object>} - Objeto con el resultado de la operación
 */
export const saveCashRequest = async (requestData) => {
  try {
    const { data, error } = await supabase
      .from('cash_requests')
      .insert([requestData])
      .select();

    if (error) throw error;
    
    // Guardar los datos del cliente en la tabla applications
    if (data && data.length > 0) {
      await saveToApplicationsTable({
        simulation_id: data[0].id,
        simulation_type: 'cash',
        client_name: requestData.client_name,
        client_email: requestData.client_email,
        client_phone: requestData.client_phone,
        status: 'Solicitud',
        company_id: requestData.company_id,
        company_name: requestData.company_name
      });
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error al guardar la solicitud de efectivo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Guarda un plan seleccionado en Supabase y actualiza la referencia en la tabla correspondiente
 * @param {Object} planData - Datos del plan seleccionado
 * @returns {Promise<Object>} - Objeto con el resultado de la operación
 */
export const saveSelectedPlan = async (planData) => {
  try {
    console.log('======== DEBUG SAVE SELECTED PLAN ========');
    console.log('Guardando plan seleccionado con datos:');
    console.log('- Tipo de simulación:', planData.simulation_type);
    console.log('- ID de simulación:', planData.simulation_id);
    console.log('- Datos completos:', planData);
    
    // Validaciones previas
    if (!planData.simulation_id) {
      console.error('Error: ID de simulación (simulation_id) es nulo o vacío');
      return { success: false, error: 'ID de simulación no proporcionado' };
    }
    
    if (!planData.simulation_type) {
      console.error('Error: Tipo de simulación (simulation_type) es nulo o vacío');
      return { success: false, error: 'Tipo de simulación no proporcionado' };
    }
    
    // Insertar el plan seleccionado
    const { data, error } = await supabase
      .from('selected_plans')
      .insert([planData])
      .select();

    if (error) {
      console.error('Error al insertar en selected_plans:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No se devolvieron datos al insertar el plan seleccionado');
      throw new Error('No se obtuvieron datos al guardar el plan');
    }
    
    console.log('Plan seleccionado guardado exitosamente:', data);
    
    // Actualizar el estado en applications al seleccionar un plan
    if (data && data.length > 0) {
      await updateApplicationStatus({
        simulation_id: planData.simulation_id,
        simulation_type: planData.simulation_type,
        client_name: planData.client_name,
        client_email: planData.client_email,
        client_phone: planData.client_phone,
        status: 'Completado',
        plan_id: data[0].id
      });
    }
    
    let updateResult = null;
    
    // Actualizar la referencia en la tabla correspondiente
    if (planData.simulation_type === 'product') {
      console.log('Actualizando referencia en product_simulations');
      updateResult = await updateProductSimulationWithPlan(planData.simulation_id, data[0].id);
      console.log('Resultado de actualizar product_simulations:', updateResult);
      
      if (!updateResult.success) {
        console.error('Error al actualizar product_simulations:', updateResult.error);
        return { 
          success: true, 
          data,
          warning: 'Plan guardado pero no se pudo actualizar la referencia en product_simulations',
          updateError: updateResult.error
        };
      }
    } else if (planData.simulation_type === 'cash') {
      console.log('Actualizando referencia en cash_requests');
      updateResult = await updateCashRequestWithPlan(planData.simulation_id, data[0].id);
      console.log('Resultado de actualizar cash_requests:', updateResult);
      
      if (!updateResult.success) {
        console.error('Error al actualizar cash_requests:', updateResult.error);
        return { 
          success: true, 
          data,
          warning: 'Plan guardado pero no se pudo actualizar la referencia en cash_requests',
          updateError: updateResult.error
        };
      }
    } else {
      console.warn('Tipo de simulación desconocido:', planData.simulation_type);
      return { 
        success: true, 
        data,
        warning: `Tipo de simulación desconocido: ${planData.simulation_type}, no se actualizó ninguna referencia`
      };
    }
    
    return { success: true, data, updateResult };
  } catch (error) {
    console.error('Error al guardar el plan seleccionado:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Actualiza una simulación de producto con el ID del plan seleccionado
 * @param {string} simulationId - ID de la simulación
 * @param {string} planId - ID del plan seleccionado
 * @returns {Promise<Object>} - Objeto con el resultado de la operación
 */
const updateProductSimulationWithPlan = async (simulationId, planId) => {
  try {
    const { data, error } = await supabase
      .from('product_simulations')
      .update({ selected_plan_id: planId })
      .eq('id', simulationId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar la simulación de producto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Actualiza una solicitud de efectivo con el ID del plan seleccionado
 * @param {string} requestId - ID de la solicitud
 * @param {string} planId - ID del plan seleccionado
 * @returns {Promise<Object>} - Objeto con el resultado de la operación
 */
const updateCashRequestWithPlan = async (requestId, planId) => {
  try {
    console.log('======== DEBUG UPDATE CASH REQUEST ========');
    console.log('Actualizando solicitud de efectivo con plan seleccionado:');
    console.log('- ID de solicitud (simulation_id):', requestId);
    console.log('- ID de plan seleccionado:', planId);
    
    if (!requestId) {
      console.error('Error: ID de solicitud (requestId) es nulo o vacío');
      return { success: false, error: 'ID de solicitud no proporcionado' };
    }
    
    if (!planId) {
      console.error('Error: ID de plan (planId) es nulo o vacío');
      return { success: false, error: 'ID de plan no proporcionado' };
    }
    
    const { data, error } = await supabase
      .from('cash_requests')
      .update({ selected_plan_id: planId })
      .eq('id', requestId);

    if (error) {
      console.error('Error al actualizar cash_requests:', error);
      throw error;
    }
    
    console.log('Actualización de cash_requests exitosa:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar la solicitud de efectivo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Actualiza el monto neto en una solicitud de efectivo
 * @param {string} requestId - ID de la solicitud
 * @param {number} netAmount - Monto neto a recibir
 * @returns {Promise<Object>} - Objeto con el resultado de la operación
 */
export const updateCashRequestNetAmount = async (requestId, netAmount) => {
  try {
    console.log('Actualizando monto neto en cash_requests:', {
      requestId,
      netAmount
    });
    
    if (!requestId) {
      console.error('Error: ID de solicitud (requestId) es nulo o vacío');
      return { success: false, error: 'ID de solicitud no proporcionado' };
    }
    
    const { data, error } = await supabase
      .from('cash_requests')
      .update({ net_amount: netAmount })
      .eq('id', requestId);

    if (error) {
      console.error('Error al actualizar monto neto en cash_requests:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Monto neto actualizado correctamente en cash_requests');
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar monto neto en cash_requests:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtiene el advisor asociado a una empresa
 * @param {string} companyId - ID de la empresa
 * @returns {Promise<Object>} - Objeto con los datos del advisor
 */
export const getCompanyAdvisor = async (companyId) => {
  try {
    console.log('Buscando advisor para empresa con ID:', companyId);
    
    // Primero obtenemos la empresa para verificar si tiene un advisor_id
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('advisor_id, name, employee_code, Advisor')  // Incluir nombre para depuración
      .eq('id', companyId)
      .single();

    if (companyError) {
      console.error('Error al consultar la empresa:', companyError);
      throw companyError;
    }
    
    console.log('Datos de la empresa obtenidos:', companyData);
    
    // Mapeo especial de códigos de empresa a códigos de advisor
    const companyCodeToAdvisorMap = {
      'CAD0227': '0021', // Alexis Medina - CADTONER
      'CAR5799': '0095', // Angelica Elizondo - Tía Carmen
      'TRA5976': '0095', // Angelica Elizondo - Transportes
      'PRE2030': '0095', // Angelica Elizondo - Presidencia
      'RAQ3329': '0095', // Angelica Elizondo - Doña Raquel
      'CAR9424': '9076', // Edgar Benavides - Cartotec
      'GSL9775': '4522'  // Diego Garza - Industrias GSL
    };
    
    // Verificar si hay un mapeo directo por código de empresa
    if (companyData.employee_code && companyCodeToAdvisorMap[companyData.employee_code]) {
      const advisorCode = companyCodeToAdvisorMap[companyData.employee_code];
      console.log('Usando mapeo directo por código de empresa:', companyData.employee_code, '→', advisorCode);
      
      const { data: advisorByCode, error: advisorByCodeError } = await supabase
        .from('advisors')
        .select('*')
        .eq('access_code', advisorCode)
        .single();
        
      if (!advisorByCodeError && advisorByCode) {
        console.log('Advisor encontrado por mapeo directo:', advisorByCode);
        
        // Actualizar la empresa con el advisor_id encontrado
        await supabase
          .from('companies')
          .update({ advisor_id: advisorByCode.id })
          .eq('id', companyId);
          
        return { success: true, data: advisorByCode };
      }
    }
    
    // Si no tiene advisor_id pero tiene la columna texto Advisor, intentamos buscar el advisor por nombre
    if (!companyData.advisor_id && companyData.Advisor) {
      console.log('Buscando advisor por nombre:', companyData.Advisor);
      
      // Limpiar el nombre para la búsqueda (quitar acentos, etc.)
      const cleanName = companyData.Advisor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/['"]/g, "");
      
      console.log('Nombre limpio para búsqueda:', cleanName);
      
      const { data: advisorByName, error: advisorByNameError } = await supabase
        .from('advisors')
        .select('*')
        .ilike('name', `%${cleanName}%`)
        .limit(1);
        
      if (!advisorByNameError && advisorByName && advisorByName.length > 0) {
        console.log('Advisor encontrado por nombre:', advisorByName[0]);
        
        // Actualizar la empresa con el advisor_id encontrado
        await supabase
          .from('companies')
          .update({ advisor_id: advisorByName[0].id })
          .eq('id', companyId);
          
        return { success: true, data: advisorByName[0] };
      } else {
        console.warn('No se encontró el advisor por nombre:', companyData.Advisor);
      }
    }
    
    // Si tiene advisor_id, lo usamos para obtener los datos del advisor
    if (companyData.advisor_id) {
      console.log('Buscando advisor con ID:', companyData.advisor_id);
      
      const { data: advisorData, error: advisorError } = await supabase
        .from('advisors')
        .select('*')
        .eq('id', companyData.advisor_id)
        .single();

      if (advisorError) {
        console.error('Error al consultar el advisor:', advisorError);
        throw advisorError;
      }
      
      console.log('Advisor encontrado:', advisorData);
      return { success: true, data: advisorData };
    }
    
    // Intentar encontrar por nombre de empresa (útil para casos específicos)
    if (companyData.name) {
      console.log('Intentando buscar por nombre de empresa:', companyData.name);
      
      // Mapeo de palabras clave de empresas a asesores
      const keywordToAdvisorMap = {
        'Carmen': '0095', // Angelica Elizondo
        'Transportes': '0095', // Angelica Elizondo
        'Presidencia': '0095', // Angelica Elizondo
        'Raquel': '0095', // Angelica Elizondo
        'CADTONER': '0021', // Alexis Medina
        'Cartotec': '9076', // Edgar Benavides
        'GSL': '4522' // Diego Garza
      };
      
      for (const keyword in keywordToAdvisorMap) {
        if (companyData.name.includes(keyword)) {
          const advisorCode = keywordToAdvisorMap[keyword];
          console.log('Coincidencia por palabra clave:', keyword, '→', advisorCode);
          
          const { data: advisorByKey, error: advisorByKeyError } = await supabase
            .from('advisors')
            .select('*')
            .eq('access_code', advisorCode)
            .single();
            
          if (!advisorByKeyError && advisorByKey) {
            console.log('Advisor encontrado por palabra clave:', advisorByKey);
            
            // Actualizar la empresa con el advisor_id encontrado
            await supabase
              .from('companies')
              .update({ advisor_id: advisorByKey.id })
              .eq('id', companyId);
              
            return { success: true, data: advisorByKey };
          }
        }
      }
    }
    
    // Si llegamos aquí, no se encontró el advisor
    console.warn('La empresa no tiene un advisor asignado o no se pudo encontrar');
    return { success: false, error: 'La empresa no tiene un advisor asignado' };
  } catch (error) {
    console.error('Error al obtener el advisor de la empresa:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Guarda información en la tabla applications
 * @param {Object} applicationData - Datos para la tabla applications
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveToApplicationsTable = async (applicationData) => {
  try {
    console.log('Guardando en tabla applications:', applicationData);
    
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        status: applicationData.status,
        client_name: applicationData.client_name,
        client_email: applicationData.client_email,
        client_phone: applicationData.client_phone,
        simulation_id: applicationData.simulation_id,
        simulation_type: applicationData.simulation_type,
        company_id: applicationData.company_id,
        company_name: applicationData.company_name
      }])
      .select();
      
    if (error) {
      console.error('Error al guardar en applications:', error);
      return { success: false, error };
    }
    
    console.log('Guardado exitoso en applications:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al guardar en applications:', error);
    return { success: false, error };
  }
};

/**
 * Actualiza el estado de una aplicación en la tabla applications
 * @param {Object} updateData - Datos para actualizar en la tabla applications
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const updateApplicationStatus = async (updateData) => {
  try {
    console.log('Actualizando estado en applications:', updateData);
    
    // Buscar el registro correspondiente en la tabla applications
    const { data: existingRecords, error: queryError } = await supabase
      .from('applications')
      .select('id')
      .eq('simulation_id', updateData.simulation_id)
      .eq('simulation_type', updateData.simulation_type);
      
    if (queryError) {
      console.error('Error al buscar aplicación:', queryError);
      return { success: false, error: queryError };
    }
    
    if (existingRecords && existingRecords.length > 0) {
      // Actualizar el registro existente
      const { data, error } = await supabase
        .from('applications')
        .update({
          status: updateData.status,
          client_name: updateData.client_name || null,
          client_email: updateData.client_email || null,
          client_phone: updateData.client_phone || null,
          selected_plan_id: updateData.plan_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecords[0].id);
        
      if (error) {
        console.error('Error al actualizar applications:', error);
        return { success: false, error };
      }
      
      console.log('Actualización exitosa en applications:', data);
      return { success: true, data };
    } else {
      // Si no existe el registro, crear uno nuevo
      return await saveToApplicationsTable({
        ...updateData,
        status: updateData.status
      });
    }
  } catch (error) {
    console.error('Error al actualizar applications:', error);
    return { success: false, error };
  }
}; 