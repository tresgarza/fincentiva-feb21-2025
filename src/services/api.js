import { API_URL } from '../config/api';

console.log('API URL:', API_URL);

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
  console.log('Sending request to backend for URL:', url);
  
  try {
    console.log('Making request to:', `${API_URL}/product/info`);
    
    const response = await fetch(`${API_URL}/product/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ url }),
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