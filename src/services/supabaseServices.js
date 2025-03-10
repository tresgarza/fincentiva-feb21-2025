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
    return { success: true, data };
  } catch (error) {
    console.error('Error al guardar la solicitud de efectivo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Guarda un plan seleccionado en Supabase
 * @param {Object} planData - Datos del plan seleccionado
 * @returns {Promise<Object>} - Objeto con el resultado de la operación
 */
export const saveSelectedPlan = async (planData) => {
  try {
    const { data, error } = await supabase
      .from('selected_plans')
      .insert([planData])
      .select();

    if (error) throw error;
    
    // Actualizar la referencia en la tabla correspondiente
    if (planData.simulation_type === 'product') {
      await updateProductSimulationWithPlan(planData.simulation_id, data[0].id);
    } else if (planData.simulation_type === 'cash') {
      await updateCashRequestWithPlan(planData.simulation_id, data[0].id);
    }
    
    return { success: true, data };
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
    const { data, error } = await supabase
      .from('cash_requests')
      .update({ selected_plan_id: planId })
      .eq('id', requestId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar la solicitud de efectivo:', error);
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
    
    // Si no tiene advisor_id pero tiene la columna texto Advisor, intentamos buscar el advisor por nombre
    if (!companyData.advisor_id && companyData.Advisor) {
      console.log('Buscando advisor por nombre:', companyData.Advisor);
      
      const { data: advisorByName, error: advisorByNameError } = await supabase
        .from('advisors')
        .select('*')
        .ilike('name', `%${companyData.Advisor}%`)
        .single();
        
      if (!advisorByNameError && advisorByName) {
        console.log('Advisor encontrado por nombre:', advisorByName);
        
        // Actualizar la empresa con el advisor_id encontrado
        const { error: updateError } = await supabase
          .from('companies')
          .update({ advisor_id: advisorByName.id })
          .eq('id', companyId);
          
        if (updateError) {
          console.warn('No se pudo actualizar la empresa con el advisor_id:', updateError);
        } else {
          console.log('Empresa actualizada con advisor_id:', advisorByName.id);
        }
        
        return { success: true, data: advisorByName };
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
    
    // Si llegamos aquí, no se encontró el advisor
    console.warn('La empresa no tiene un advisor asignado');
    return { success: false, error: 'La empresa no tiene un advisor asignado' };
  } catch (error) {
    console.error('Error al obtener el advisor de la empresa:', error);
    return { success: false, error: error.message };
  }
}; 