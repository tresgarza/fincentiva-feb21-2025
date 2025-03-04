/**
 * Utilidad para probar la conexión a Supabase con una clave personalizada
 * 
 * IMPORTANTE: Este archivo es solo para depuración y pruebas.
 * NO lo incluyas en producción ni lo subas a Git.
 */

// Función para probar la conexión a Supabase con una clave personalizada
// REEMPLAZA con la nueva clave que obtengas del panel de Supabase
export const testSupabaseDirectly = async (customKey) => {
  if (!customKey || customKey.trim() === '') {
    console.error('Por favor proporciona una clave API válida para probar');
    return { error: 'Clave API no proporcionada' };
  }
  
  // URL de Supabase tal como aparece en tus logs
  const supabaseUrl = 'https://ydnygntfkrleiseuciwq.supabase.co';
  
  console.log('Probando conexión con nueva clave API...');
  console.log('Longitud de la clave proporcionada:', customKey.length);
  
  try {
    // Intentar una solicitud GET básica con la nueva clave
    const response = await fetch(
      `${supabaseUrl}/rest/v1/product_financing_simulations?limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': customKey,
          'Authorization': `Bearer ${customKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error con código ${response.status}:`, errorText);
      return { 
        success: false, 
        status: response.status, 
        error: errorText
      };
    }
    
    const data = await response.json();
    console.log('¡Conexión exitosa! Datos recibidos:', data);
    return { 
      success: true, 
      data,
      message: 'Conexión establecida correctamente con la nueva clave API'
    };
  } catch (error) {
    console.error('Error al intentar conectar con Supabase:', error);
    return { success: false, error: error.message };
  }
};

// Instrucciones de uso:
/*
Para probar una nueva clave API, abre la consola del navegador y ejecuta:

import { testSupabaseDirectly } from './utils/testSupabaseConnection';
testSupabaseDirectly('tu-nueva-clave-aqui').then(result => console.log(result));
*/ 