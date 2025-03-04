import { supabase } from '../config/supabase';

/**
 * Guarda una simulación de financiamiento de producto en Supabase
 * @param {Object} simulationData - Datos de la simulación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveProductFinancingSimulation = async (simulationData) => {
  try {
    console.log('Attempting to save product simulation with data:', simulationData);
    
    // Verificar la conexión con Supabase
    const { data: connectionTest, error: connectionError } = await supabase.from('product_financing_simulations').select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('Supabase connection test error:', connectionError);
      throw new Error(`Error de conexión: ${connectionError.message}`);
    }
    
    console.log('Supabase connection successful, proceeding with insert');
    
    const { data, error } = await supabase
      .from('product_financing_simulations')
      .insert([simulationData])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Simulación de producto guardada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al guardar simulación de producto:', error);
    return { success: false, error };
  }
};

/**
 * Guarda una simulación de solicitud de efectivo en Supabase
 * @param {Object} simulationData - Datos de la simulación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveCashRequestSimulation = async (simulationData) => {
  try {
    console.log('Attempting to save cash simulation with data:', simulationData);
    
    // Verificar la conexión con Supabase
    const { data: connectionTest, error: connectionError } = await supabase.from('cash_request_simulations').select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('Supabase connection test error:', connectionError);
      throw new Error(`Error de conexión: ${connectionError.message}`);
    }
    
    console.log('Supabase connection successful, proceeding with insert');
    
    const { data, error } = await supabase
      .from('cash_request_simulations')
      .insert([simulationData])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Simulación de efectivo guardada:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al guardar simulación de efectivo:', error);
    return { success: false, error };
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
    console.log('Attempting to update product simulation with selected plan:', { simulationId, selectedPlanId });
    
    const { data, error } = await supabase
      .from('product_financing_simulations')
      .update({ 
        selected_plan_id: selectedPlanId,
        status: 'selected'
      })
      .eq('id', simulationId)
      .select();

    if (error) {
      console.error('Error updating product financing with selected plan:', error);
      throw error;
    }
    
    console.log('Plan seleccionado actualizado para producto:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar plan seleccionado para producto:', error);
    return { success: false, error };
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
    console.log('Attempting to update cash simulation with selected plan:', { simulationId, selectedPlanId });
    
    const { data, error } = await supabase
      .from('cash_request_simulations')
      .update({ 
        selected_plan_id: selectedPlanId,
        status: 'selected'
      })
      .eq('id', simulationId)
      .select();

    if (error) {
      console.error('Error updating cash request with selected plan:', error);
      throw error;
    }
    
    console.log('Plan seleccionado actualizado para efectivo:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al actualizar plan seleccionado para efectivo:', error);
    return { success: false, error };
  }
}; 