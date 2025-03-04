import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './api';

// Log para depuración
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key length:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.length : 0);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

// Crear el cliente con opciones adicionales
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export { supabase }; 