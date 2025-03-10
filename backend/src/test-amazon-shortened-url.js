/**
 * Script de prueba para verificar la resolución de enlaces acortados de Amazon
 * 
 * Ejecutar con: node test-amazon-shortened-url.js
 */

import axios from 'axios';

// El enlace acortado de Amazon que queremos probar
const shortenedUrl = 'https://a.co/d/93pZDDC'; // Reemplaza esto con tu enlace de prueba

async function resolveShortUrl(url) {
  console.log('Resolving shortened URL:', url);
  
  try {
    // Intento 1: Usar HEAD request (más rápido)
    console.log('Attempting HEAD request...');
    const headResponse = await axios.head(url, {
      maxRedirects: 10,
      timeout: 10000,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    // Intentar diferentes métodos para obtener la URL final
    let fullUrl = '';
    
    if (headResponse.request && headResponse.request.res && headResponse.request.res.responseUrl) {
      fullUrl = headResponse.request.res.responseUrl;
      console.log('Method 1: Using responseUrl from response.request.res:', fullUrl);
    } 
    else if (headResponse.request && headResponse.request.res && headResponse.request.res.req && headResponse.request.res.req.path) {
      fullUrl = headResponse.request.res.req.path;
      console.log('Method 2: Using path from response.request.res.req:', fullUrl);
    }
    else if (headResponse.request && headResponse.request.path) {
      fullUrl = headResponse.request.path;
      console.log('Method 3: Using path from response.request:', fullUrl);
    }
    else if (headResponse.request && headResponse.request.responseURL) {
      fullUrl = headResponse.request.responseURL;
      console.log('Method 4: Using responseURL from response.request:', fullUrl);
    }
    
    // Si encontramos una URL válida de Amazon, terminamos
    if (fullUrl && (fullUrl.includes('amazon.com') || fullUrl.includes('amazon.com.mx'))) {
      console.log('SUCCESS: Resolved to Amazon URL:', fullUrl);
      return fullUrl;
    }
    
    // Intento 2: Usar GET request completo y buscar URL canónica
    console.log('HEAD request did not provide valid URL. Attempting GET request...');
    const getResponse = await axios.get(url, {
      maxRedirects: 10,
      timeout: 10000,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    // Comprobar si la respuesta tiene una URL canónica
    const html = getResponse.data;
    console.log('Received HTML content length:', html.length);
    
    // Buscar URL canónica en el HTML
    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/i);
    if (canonicalMatch && canonicalMatch[1]) {
      fullUrl = canonicalMatch[1];
      console.log('Method 5: Found canonical URL in HTML:', fullUrl);
    } 
    else if (getResponse.request && getResponse.request.res && getResponse.request.res.responseUrl) {
      fullUrl = getResponse.request.res.responseUrl;
      console.log('Method 6: Using responseUrl from GET response:', fullUrl);
    }
    
    if (fullUrl && (fullUrl.includes('amazon.com') || fullUrl.includes('amazon.com.mx'))) {
      console.log('SUCCESS: Resolved to Amazon URL:', fullUrl);
      return fullUrl;
    }
    
    console.log('FAILED: Could not resolve to valid Amazon URL');
    return null;
  } catch (error) {
    console.error('Error resolving shortened URL:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

// Ejecutar la prueba
resolveShortUrl(shortenedUrl)
  .then(fullUrl => {
    if (fullUrl) {
      console.log('Test completed successfully. Final URL:', fullUrl);
    } else {
      console.log('Test failed. Could not resolve URL.');
    }
  })
  .catch(error => {
    console.error('Test failed with error:', error);
  }); 