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

// Crear el cliente con configuración para evitar errores de CORS y autenticación
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Info': 'supabase-js/2.x'
    },
    fetch: (url, options) => {
      // Log para depuración
      console.log('Supabase fetch request:', url);
      console.log('Supabase fetch options:', JSON.stringify({
        method: options.method,
        headers: options.headers
      }, null, 2));
      return fetch(url, {
        ...options,
        credentials: 'same-origin'
      });
    }
  },
  realtime: {
    timeout: 30000
  }
});

// Probar la conexión de inmediato
(async () => {
  try {
    console.log('Intentando conexión inicial con Supabase...');
    const { data, error, status } = await supabase.from('product_financing_simulations').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error al probar la conexión inicial con Supabase:', error);
      console.error('Status code:', status);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('Conexión inicial con Supabase exitosa:', data);
    }
  } catch (err) {
    console.error('Excepción al probar la conexión inicial con Supabase:', err);
  }
})();

export { supabase }; 