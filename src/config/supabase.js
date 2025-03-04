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
    persistSession: true, // Permitir persistencia de sesión para usuarios anónimos
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    },
  },
  realtime: {
    timeout: 30000
  }
});

// Probar la conexión de inmediato
(async () => {
  try {
    const { error } = await supabase.from('product_financing_simulations').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Error al probar la conexión inicial con Supabase:', error);
    } else {
      console.log('Conexión inicial con Supabase exitosa');
    }
  } catch (err) {
    console.error('Excepción al probar la conexión inicial con Supabase:', err);
  }
})();

export { supabase }; 