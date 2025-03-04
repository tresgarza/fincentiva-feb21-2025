import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './api';
import { validateAndCleanSupabaseKey, getCleanApiKey } from '../utils/validateApiKey';

// Log para depuración - mostrando los primeros y últimos caracteres para verificar sin exponer la clave completa
console.log('Supabase URL:', SUPABASE_URL);

// Validar y limpiar la clave API
const keyValidation = validateAndCleanSupabaseKey(SUPABASE_ANON_KEY);
const cleanedKey = keyValidation.cleanedKey;

if (!keyValidation.isValid) {
  console.error('ADVERTENCIA - PROBLEMAS CON LA CLAVE API DE SUPABASE:');
  keyValidation.messages.forEach(msg => console.error(`- ${msg}`));
} else if (keyValidation.messages.length > 0) {
  console.warn('Observaciones sobre la clave API de Supabase:');
  keyValidation.messages.forEach(msg => console.warn(`- ${msg}`));
}

// Mostrar información de diagnóstico si está disponible
if (keyValidation.diagnostics.jwt) {
  console.log('Información de la clave JWT:', keyValidation.diagnostics.jwt);
}

// Si la clave fue limpiada, mostrar que se está usando la versión limpia
if (cleanedKey !== SUPABASE_ANON_KEY) {
  console.log('Se utilizará una versión limpia de la clave API (espacios en blanco eliminados)');
}

if (!SUPABASE_URL || !cleanedKey) {
  console.error('Credenciales de Supabase faltantes. Verifique sus variables de entorno.');
}

// Crear cliente Supabase con la clave limpia
const supabase = createClient(SUPABASE_URL, cleanedKey);

// Función mejorada para realizar solicitudes directas a Supabase
export const supabaseFetch = async (endpoint, options = {}) => {
  try {
    // Asegurarse de que la URL no tenga barras duplicadas
    const baseUrl = SUPABASE_URL.endsWith('/') 
      ? SUPABASE_URL.slice(0, -1) 
      : SUPABASE_URL;
    
    const url = `${baseUrl}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
    
    // Usar la clave limpia para los headers
    const headers = {
      'apikey': cleanedKey,
      'Authorization': `Bearer ${cleanedKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {})
    };
    
    console.log(`Realizando fetch directo a: ${url}`);
    console.log('Headers configurados correctamente:', 
      Object.keys(headers).map(k => `${k}: ${k === 'apikey' || k === 'Authorization' ? '[HIDDEN]' : 'presente'}`));
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    console.log(`Respuesta de fetch directo: Status ${response.status}`);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'No se pudo obtener el texto del error';
      }
      
      throw {
        status: response.status,
        message: `Error ${response.status}: ${errorText}`
      };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error en supabaseFetch:', error);
    return { 
      data: null, 
      error: {
        status: error.status || 500,
        message: error.message || 'Error desconocido en fetch directo'
      } 
    };
  }
};

// Probar la conexión de inmediato
(async () => {
  try {
    console.log('Intentando conexión inicial con Supabase usando fetch directo...');
    
    // Usar fetch directamente para probar la conexión
    const testResult = await supabaseFetch('rest/v1/product_financing_simulations?limit=1');
    
    if (testResult.error) {
      console.error('Error en prueba inicial:', testResult.error);
    } else {
      console.log('Conexión exitosa con fetch directo:', testResult.data);
    }
    
    // También probar con el cliente de Supabase
    const { data, error } = await supabase
      .from('product_financing_simulations')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Error con cliente Supabase:', error);
    } else {
      console.log('Conexión exitosa con cliente Supabase:', data);
    }
  } catch (e) {
    console.error('Error en prueba de conexión inicial:', e);
  }
})();

export default supabase; 