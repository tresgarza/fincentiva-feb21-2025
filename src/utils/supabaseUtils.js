import { supabase } from '../config/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/api';

/**
 * Comprueba la conexión a Supabase y registra información detallada sobre problemas
 * @returns {Promise<boolean>} Verdadero si la conexión es exitosa
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Intenta una petición simple para comprobar la conexión
    const { data, error, status } = await supabase
      .from('product_financing_simulations')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection failed:', error);
      console.error('Status code:', status);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Verificar la configuración
      console.log('Supabase URL being used:', SUPABASE_URL);
      if (SUPABASE_ANON_KEY) {
        console.log('Key length:', SUPABASE_ANON_KEY.length);
      } else {
        console.error('API key is missing!');
      }
      
      return false;
    }
    
    console.log('Supabase connection successful!');
    return true;
  } catch (e) {
    console.error('Exception during Supabase connection test:', e);
    return false;
  }
};

/**
 * Hace una inserción en Supabase con manejo mejorado de errores
 * @param {string} table - Nombre de la tabla
 * @param {Object} data - Datos a insertar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const insertWithRetry = async (table, data) => {
  try {
    // Probar la conexión primero
    const isConnected = await testSupabaseConnection();
    
    if (!isConnected) {
      console.error('Cannot insert data: Supabase connection failed');
      return { 
        success: false, 
        error: { message: 'No se pudo conectar con la base de datos' } 
      };
    }
    
    // Intentar la inserción
    console.log(`Inserting data into ${table}:`, data);
    
    const result = await supabase
      .from(table)
      .insert([data])
      .select();
    
    if (result.error) {
      console.error(`Error inserting into ${table}:`, result.error);
      return { success: false, error: result.error };
    }
    
    console.log(`Successfully inserted into ${table}:`, result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Exception during insert into ${table}:`, error);
    return { 
      success: false, 
      error: { message: `Error inesperado: ${error.message}` }
    };
  }
};

/**
 * Hace una actualización en Supabase con manejo mejorado de errores
 * @param {string} table - Nombre de la tabla
 * @param {Object} updates - Datos a actualizar
 * @param {string} idField - Campo de ID para la condición
 * @param {string} idValue - Valor del ID para la condición
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const updateWithRetry = async (table, updates, idField, idValue) => {
  try {
    // Probar la conexión primero
    const isConnected = await testSupabaseConnection();
    
    if (!isConnected) {
      console.error('Cannot update data: Supabase connection failed');
      return { 
        success: false, 
        error: { message: 'No se pudo conectar con la base de datos' } 
      };
    }
    
    // Intentar la actualización
    console.log(`Updating data in ${table} where ${idField}=${idValue}:`, updates);
    
    const result = await supabase
      .from(table)
      .update(updates)
      .eq(idField, idValue)
      .select();
    
    if (result.error) {
      console.error(`Error updating ${table}:`, result.error);
      return { success: false, error: result.error };
    }
    
    console.log(`Successfully updated ${table}:`, result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Exception during update of ${table}:`, error);
    return { 
      success: false, 
      error: { message: `Error inesperado: ${error.message}` }
    };
  }
}; 