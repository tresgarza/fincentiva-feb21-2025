import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './api';

// Log para depuración - mostrando los primeros y últimos caracteres para verificar sin exponer la clave completa
console.log('Supabase URL:', SUPABASE_URL);
if (SUPABASE_ANON_KEY) {
  const keyLength = SUPABASE_ANON_KEY.length;
  console.log('Supabase Key length:', keyLength);
  console.log('Key prefix:', SUPABASE_ANON_KEY.substring(0, 5) + '...');
  console.log('Key suffix:', '...' + SUPABASE_ANON_KEY.substring(keyLength - 5, keyLength));
} else {
  console.error('Supabase key is undefined or empty');
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

// Crear un cliente básico sin configuraciones adicionales
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Probar la conexión de inmediato con headers explícitos
(async () => {
  try {
    console.log('Intentando conexión inicial con Supabase usando fetch directo...');
    
    // Usar fetch directamente para probar la conexión
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/product_financing_simulations?select=count`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.error('Error al probar la conexión directa con Supabase:', response.status);
      console.error('Mensaje:', await response.text());
    } else {
      const data = await response.json();
      console.log('Conexión directa con Supabase exitosa:', data);
      
      // Si la conexión directa funciona, intentar con el cliente de Supabase
      console.log('Probando ahora con el cliente de Supabase...');
      const { data: supabaseData, error } = await supabase
        .from('product_financing_simulations')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error al probar con el cliente de Supabase:', error);
      } else {
        console.log('Conexión con cliente de Supabase exitosa:', supabaseData);
      }
    }
  } catch (err) {
    console.error('Excepción al probar la conexión con Supabase:', err);
  }
})();

// Crear una función auxiliar para realizar operaciones con fetch directo
// como alternativa al cliente de Supabase si sigue fallando
export const supabaseFetch = async (endpoint, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      return { 
        error: { 
          message: `Error ${response.status}: ${await response.text()}`,
          status: response.status 
        } 
      };
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: { message: error.message } };
  }
};

export { supabase }; 