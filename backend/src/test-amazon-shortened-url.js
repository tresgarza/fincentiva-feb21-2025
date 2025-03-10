/**
 * Script de prueba para verificar la resolución de enlaces acortados de Amazon
 * 
 * Ejecutar con: node test-amazon-shortened-url.js
 */

import axios from 'axios';
import fetch from 'node-fetch'; // Asegúrate de instalar con: npm install node-fetch

// El enlace acortado de Amazon que queremos probar
const shortenedUrl = 'https://a.co/d/93pZDDC'; // Reemplaza esto con tu enlace de prueba

async function resolveShortUrl(url) {
  console.log('Resolving shortened URL:', url);
  
  // MÉTODO 1: Usando fetch API (más simple y directo)
  try {
    console.log('\nTrying with fetch API (follow redirects)...');
    const fetchResponse = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    const finalUrl = fetchResponse.url;
    console.log('Final URL from fetch:', finalUrl);
    
    if (finalUrl && (finalUrl.includes('amazon.com') || finalUrl.includes('amazon.com.mx'))) {
      console.log('SUCCESS: Resolved to Amazon URL with fetch method!');
      return finalUrl;
    }
    
    console.log('Fetch did not resolve to Amazon URL, trying other methods...');
  } catch (fetchError) {
    console.error('Error with fetch method:', fetchError.message);
    console.log('Fetch method failed, falling back to other methods...');
  }
  
  // MÉTODO 2: Usando axios para obtener el HTML completo y analizarlo
  try {
    console.log('\nTrying with axios GET request...');
    const axiosResponse = await axios.get(url, {
      maxRedirects: 15,
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    
    // Analizar el HTML para encontrar la URL de Amazon
    const html = axiosResponse.data;
    console.log('Got HTML response, content length:', html.length);
    
    // Varias estrategias para encontrar la URL correcta
    let amazonUrl = '';
    
    // Estrategia 1: Buscar enlace canónico
    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/i);
    if (canonicalMatch && canonicalMatch[1]) {
      amazonUrl = canonicalMatch[1];
      console.log('Found canonical URL:', amazonUrl);
      if (amazonUrl.includes('amazon.com') || amazonUrl.includes('amazon.com.mx')) {
        console.log('SUCCESS: Found Amazon URL in canonical link!');
        return amazonUrl;
      }
    }
    
    // Estrategia 2: Buscar meta redirección
    const metaRedirectMatch = html.match(/<meta http-equiv="refresh" content="[^"]*url=([^"]+)"/i);
    if (metaRedirectMatch && metaRedirectMatch[1]) {
      amazonUrl = metaRedirectMatch[1];
      console.log('Found meta redirect URL:', amazonUrl);
      if (amazonUrl.includes('amazon.com') || amazonUrl.includes('amazon.com.mx')) {
        console.log('SUCCESS: Found Amazon URL in meta redirect!');
        return amazonUrl;
      }
    }
    
    // Estrategia 3: Buscar cualquier URL de Amazon en el contenido
    const amazonUrlMatch = html.match(/https:\/\/(?:www\.)?amazon\.com(?:\.mx)?\/[^\s"']+/i);
    if (amazonUrlMatch) {
      amazonUrl = amazonUrlMatch[0];
      console.log('Found Amazon URL in content:', amazonUrl);
      if (amazonUrl.includes('amazon.com') || amazonUrl.includes('amazon.com.mx')) {
        console.log('SUCCESS: Found Amazon URL in HTML content!');
        return amazonUrl;
      }
    }
    
    // Estrategia 4: Obtener URL final de axios
    if (axiosResponse.request && axiosResponse.request.res && axiosResponse.request.res.responseUrl) {
      amazonUrl = axiosResponse.request.res.responseUrl;
      console.log('Using axios responseUrl:', amazonUrl);
      if (amazonUrl.includes('amazon.com') || amazonUrl.includes('amazon.com.mx')) {
        console.log('SUCCESS: Found Amazon URL from axios response!');
        return amazonUrl;
      }
    }
    
    // Si llegamos aquí, revisar si hay captcha u otros problemas
    if (html.includes('Type the characters you see in this image') || 
        html.includes('Enter the characters you see below') ||
        html.includes('Sorry, we just need to make sure you') ||
        html.includes('robot') || 
        html.includes('captcha')) {
      console.log('DETECTED: Amazon is showing a CAPTCHA verification page!');
      console.log('Preview of HTML:', html.substring(0, 300) + '...');
    }
    
    console.log('FAILED: Could not find Amazon URL in HTML content');
    return null;
  } catch (error) {
    console.error('Error resolving shortened URL with axios:', error.message);
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
      console.log('\nTest completed successfully. Final URL:', fullUrl);
    } else {
      console.log('\nTest failed. Could not resolve URL.');
    }
  })
  .catch(error => {
    console.error('\nTest failed with error:', error);
  }); 