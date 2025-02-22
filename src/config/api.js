/**
 * Configuración de la API
 * 
 * IMPORTANTE:
 * 1. Para desarrollo local, usar VITE_API_URL=http://localhost:3001/api
 * 2. Para producción, asegurarse que el backend tenga configurado CORS para aceptar:
 *    - https://fincentiva-feb21-2025-front.vercel.app
 *    - https://fincentiva-feb21-2025-front-apq30ap58-tresgarzas-projects.vercel.app
 *    - Y cualquier otro dominio de preview de Vercel
 */

const API_URL = import.meta.env.VITE_API_URL || (
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api'
    : 'https://fincentiva-feb21-2025-backend.vercel.app/api'
);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase credentials. Please check your environment variables.');
}

export { API_URL, SUPABASE_URL, SUPABASE_ANON_KEY };
export default API_URL; 