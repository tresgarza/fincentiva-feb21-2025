import { supabase } from '../config/supabase';

/**
 * Guarda una simulación de financiamiento de producto en Supabase
 * @param {Object} simulationData - Datos de la simulación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveProductFinancingSimulation = async (simulationData) => {
  try {
    const { data, error } = await supabase
      .from('product_financing_simulations')
      .insert([simulationData])
      .select();

    if (error) throw error;
    
    console.log('Simulación de producto guardada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al guardar simulación de producto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Guarda una simulación de solicitud de efectivo en Supabase
 * @param {Object} simulationData - Datos de la simulación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveCashRequestSimulation = async (simulationData) => {
  try {
    const { data, error } = await supabase
      .from('cash_request_simulations')
      .insert([simulationData])
      .select();

    if (error) throw error;
    
    console.log('Simulación de efectivo guardada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al guardar simulación de efectivo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Actualiza una simulación de financiamiento de producto con el plan seleccionado
 * @param {string} simulationId - ID de la simulación
 * @param {string} selectedPlanId - ID del plan seleccionado
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const updateProductFinancingWithSelectedPlan = async (simulationId, selectedPlanId) => {
  try {
    const { data, error } = await supabase
      .from('product_financing_simulations')
      .update({ 
        selected_plan_id: selectedPlanId,
        status: 'selected'
      })
      .eq('id', simulationId)
      .select();

    if (error) throw error;
    
    console.log('Plan seleccionado actualizado para producto:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar plan seleccionado para producto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Actualiza una simulación de solicitud de efectivo con el plan seleccionado
 * @param {string} simulationId - ID de la simulación
 * @param {string} selectedPlanId - ID del plan seleccionado
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const updateCashRequestWithSelectedPlan = async (simulationId, selectedPlanId) => {
  try {
    const { data, error } = await supabase
      .from('cash_request_simulations')
      .update({ 
        selected_plan_id: selectedPlanId,
        status: 'selected'
      })
      .eq('id', simulationId)
      .select();

    if (error) throw error;
    
    console.log('Plan seleccionado actualizado para efectivo:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar plan seleccionado para efectivo:', error);
    return { success: false, error: error.message };
  }
}; 