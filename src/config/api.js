// Definimos la URL de la API según el entorno
const API_URL = import.meta.env.VITE_API_URL || (
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api'
    : 'https://fincentiva-backend.vercel.app/api'
);

// Nuestro endpoint de prueba para verificar si la API está funcionando
export const API_HEALTHCHECK = `${API_URL}/companies`;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase credentials. Please check your environment variables.');
}

export { API_URL, SUPABASE_URL, SUPABASE_ANON_KEY };
export default API_URL; 