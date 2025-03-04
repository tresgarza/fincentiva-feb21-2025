import { supabase, supabaseFetch } from '../config/supabase';
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
      
      // Si falla el cliente de Supabase, intentar con fetch directo
      console.log('Intentando con fetch directo como alternativa...');
      const result = await supabaseFetch('product_financing_simulations?select=count');
      
      if (result.error) {
        console.error('Fetch directo también falló:', result.error);
        
        // Verificar la configuración
        console.log('Supabase URL being used:', SUPABASE_URL);
        if (SUPABASE_ANON_KEY) {
          console.log('Key length:', SUPABASE_ANON_KEY.length);
        } else {
          console.error('API key is missing!');
        }
        
        return false;
      } else {
        console.log('Fetch directo exitoso:', result.data);
        return true;
      }
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
      
      // Intentar con fetch directo como alternativa
      console.log('Intentando insertar con fetch directo...');
      const result = await supabaseFetch(table, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (result.error) {
        console.error(`Error inserting with direct fetch into ${table}:`, result.error);
        return { 
          success: false, 
          error: { message: 'No se pudo conectar con la base de datos' } 
        };
      }
      
      console.log(`Successfully inserted into ${table} with direct fetch:`, result.data);
      return { success: true, data: result.data };
    }
    
    // Intentar la inserción con el cliente de Supabase
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
      
      // Intentar con fetch directo como alternativa
      console.log('Intentando actualizar con fetch directo...');
      const result = await supabaseFetch(`${table}?${idField}=eq.${idValue}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      
      if (result.error) {
        console.error(`Error updating with direct fetch in ${table}:`, result.error);
        return { 
          success: false, 
          error: { message: 'No se pudo conectar con la base de datos' } 
        };
      }
      
      console.log(`Successfully updated ${table} with direct fetch:`, result.data);
      return { success: true, data: result.data };
    }
    
    // Intentar la actualización con el cliente de Supabase
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