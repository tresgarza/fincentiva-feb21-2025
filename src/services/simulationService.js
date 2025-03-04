import { supabase } from '../config/supabase';
import { insertWithRetry, updateWithRetry } from '../utils/supabaseUtils';

/**
 * Guarda una simulación de financiamiento de producto en Supabase
 * @param {Object} simulationData - Datos de la simulación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveProductFinancingSimulation = async (simulationData) => {
  try {
    console.log('Attempting to save product simulation with data:', simulationData);
    
    // Usar la función de utilidad para insertar con manejo de errores mejorado
    const result = await insertWithRetry('product_financing_simulations', simulationData);
    
    if (result.success) {
      console.log('Simulación de producto guardada exitosamente:', result.data);
    } else {
      console.error('Error al guardar simulación de producto:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Excepción no controlada al guardar simulación de producto:', error);
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
    
    // Usar la función de utilidad para insertar con manejo de errores mejorado
    const result = await insertWithRetry('cash_request_simulations', simulationData);
    
    if (result.success) {
      console.log('Simulación de efectivo guardada exitosamente:', result.data);
    } else {
      console.error('Error al guardar simulación de efectivo:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Excepción no controlada al guardar simulación de efectivo:', error);
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
    
    // Usar la función de utilidad para actualizar con manejo de errores mejorado
    const result = await updateWithRetry(
      'product_financing_simulations',
      { selected_plan_id: selectedPlanId, status: 'selected' },
      'id',
      simulationId
    );
    
    if (result.success) {
      console.log('Plan seleccionado actualizado para producto:', result.data);
    } else {
      console.error('Error al actualizar plan seleccionado para producto:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Excepción no controlada al actualizar plan de producto:', error);
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
    
    // Usar la función de utilidad para actualizar con manejo de errores mejorado
    const result = await updateWithRetry(
      'cash_request_simulations',
      { selected_plan_id: selectedPlanId, status: 'selected' },
      'id',
      simulationId
    );
    
    if (result.success) {
      console.log('Plan seleccionado actualizado para efectivo:', result.data);
    } else {
      console.error('Error al actualizar plan seleccionado para efectivo:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Excepción no controlada al actualizar plan de efectivo:', error);
    return { success: false, error };
  }
}; 