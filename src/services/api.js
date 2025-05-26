import { API_URL, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/api';
import { createClient } from '@supabase/supabase-js';

console.log('API URL:', API_URL);

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// User related functions
export async function getUserByPhone(phone, companyId) {
  // Bypass para usuario dummy
  if (phone === '8182838485' && companyId === 'demo-company-id') {
    return {
      id: 'demo-user-id',
      first_name: 'Diego',
      paternal_surname: 'González',
      maternal_surname: 'Demo',
      birth_date: '1985-07-22',
      phone: '8182838485',
      email: '8182838485@gmail.com',
      company_id: 'demo-company-id',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .eq('company_id', companyId)
      .single();
    
    if (error) {
      console.error('Error getting user by phone:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    return null;
  }
}

export async function registerUser(userData) {
  // Bypass para usuario dummy
  if (userData.phone === '8182838485' && userData.company_id === 'demo-company-id') {
    return {
      id: 'demo-user-id',
      first_name: userData.first_name || 'Diego',
      paternal_surname: userData.paternal_surname || 'González',
      maternal_surname: userData.maternal_surname || 'Demo',
      birth_date: userData.birth_date || '1985-07-22',
      phone: '8182838485',
      email: userData.email || '8182838485@gmail.com',
      company_id: 'demo-company-id',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
  }

  try {
    // Check if user with this phone already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', userData.phone)
      .eq('company_id', userData.company_id);
    
    if (existingUser && existingUser.length > 0) {
      throw new Error('Un usuario con este número de teléfono ya existe para esta empresa');
    }
    
    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    
    if (error) {
      console.error('Error registering user:', error);
      throw new Error(error.message || 'Error al registrar usuario');
    }
    
    return data[0];
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error(error.message || 'Error al registrar usuario');
  }
}

export async function updateUserLastLogin(userId) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user last login:', error);
    }
  } catch (error) {
    console.error('Error updating user last login:', error);
  }
}

// Company related functions
export async function getCompanies() {
  try {
    const response = await fetch(`${API_URL}/companies`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener la lista de empresas');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Error al cargar la lista de empresas');
  }
}

export async function getByCode(employeeCode) {
  // Cuenta dummy para desarrollo local
  if (employeeCode === 'DEMO123') {
    return {
      id: 'demo-company-id',
      name: 'Empresa Demo',
      code: 'DEMO123',
      description: 'Empresa de demostración para desarrollo',
      logo: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  try {
    const response = await fetch(`${API_URL}/companies/code/${employeeCode}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al verificar credenciales');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting company by code:', error);
    throw new Error('Error al verificar las credenciales de la empresa');
  }
}

export async function verifyCompanyPassword(companyId, password) {
  try {
    const response = await fetch(`${API_URL}/companies/verify-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ companyId, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al verificar credenciales');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying company password:', error);
    throw new Error('Error al verificar las credenciales de la empresa');
  }
}

export async function getProductInfo(url) {
  // Limpiar la URL antes de enviarla al backend
  let cleanUrl = url.trim();
  
  console.log('URL original recibida en getProductInfo:', cleanUrl);
  
  // Quitar el @ del inicio si existe
  if (cleanUrl.startsWith('@')) {
    console.log('URL comienza con @, removiendo el caracter inicial');
    cleanUrl = cleanUrl.substring(1);
  }
  
  // Eliminar caracteres no válidos del inicio de la URL (como @ u otros)
  cleanUrl = cleanUrl.replace(/^[^a-zA-Z0-9]+/, '');
  console.log('URL después de remover caracteres iniciales no válidos:', cleanUrl);
  
  // Asegurarse de que tenga http:// o https:// al inicio
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = cleanUrl.replace(/^[^h]+/, '');
    
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    console.log('URL normalizada con https://', cleanUrl);
  }
  
  console.log('URL final limpia para enviar al backend:', cleanUrl);
  
  try {
    console.log('Making request to:', `${API_URL}/product/info`);
    
    const response = await fetch(`${API_URL}/product/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ url: cleanUrl }),
    });

    console.log('Received response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        console.error('Error parsing error response:', e);
        errorData = {
          error: 'Error desconocido del servidor',
          details: response.statusText
        };
      }
      
      console.error('Error response data:', errorData);
      throw new Error(errorData.error || 'Error al obtener información del producto');
    }

    const data = await response.json();
    console.log('Successfully received product data:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Network or connection errors
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`No se pudo conectar con el servidor. Por favor, verifica que el servidor backend esté disponible en ${API_URL}`);
    }
    
    // Other errors
    throw new Error(error.message || 'Error desconocido al procesar la solicitud');
  }
} 