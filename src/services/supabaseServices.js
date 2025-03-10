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
    // Primero obtenemos la empresa con su advisor_id
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('advisor_id')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;
    
    if (!companyData.advisor_id) {
      console.warn('La empresa no tiene un advisor asignado');
      return { success: false, error: 'La empresa no tiene un advisor asignado' };
    }

    // Luego obtenemos los datos del advisor
    const { data: advisorData, error: advisorError } = await supabase
      .from('advisors')
      .select('*')
      .eq('id', companyData.advisor_id)
      .single();

    if (advisorError) throw advisorError;

    return { success: true, data: advisorData };
  } catch (error) {
    console.error('Error al obtener el advisor de la empresa:', error);
    return { success: false, error: error.message };
  }
}; 