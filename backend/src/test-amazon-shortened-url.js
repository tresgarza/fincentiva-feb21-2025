/**
 * Script de prueba para verificar la resolución de enlaces acortados de Amazon
 * 
 * Ejecutar con: node test-amazon-shortened-url.js
 */

import axios from 'axios';
import fetch from 'node-fetch'; // Asegúrate de instalar con: npm install node-fetch@2

// El enlace acortado de Amazon que queremos probar
const shortenedUrl = 'https://a.co/d/93pZDDC'; // El enlace específico a probar

async function resolveShortUrl(url) {
  console.log('Resolving shortened URL:', url);
  
  // MÉTODO 1: Usando fetch API (más simple y directo)
  try {
    console.log('\nTrying with fetch API (follow redirects)...');
    const fetchResponse = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 30000
    });
    
    const finalUrl = fetchResponse.url;
    console.log('Final URL from fetch:', finalUrl);
    
    if (finalUrl && (finalUrl.includes('amazon.com') || finalUrl.includes('amazon.com.mx'))) {
      console.log('SUCCESS: Resolved to Amazon URL with fetch method!');
      return finalUrl;
    }
    
    // Si fetch no resolvió a una URL de Amazon, intentar extraer de la respuesta HTML
    console.log('Fetch did not resolve to Amazon URL, attempting to extract from HTML response...');
    const htmlContent = await fetchResponse.text();
    
    // Buscar posible URL de Amazon en el HTML
    const amazonUrlMatch = htmlContent.match(/https:\/\/(?:www\.)?amazon\.com(?:\.mx)?\/[^\s"']+/i);
    if (amazonUrlMatch) {
      const extractedUrl = amazonUrlMatch[0].replace(/\\/g, '');
      console.log('Found Amazon URL in HTML response:', extractedUrl);
      
      if (extractedUrl.includes('amazon.com') || extractedUrl.includes('amazon.com.mx')) {
        console.log('SUCCESS: Extracted Amazon URL from HTML with fetch method!');
        return extractedUrl;
      }
    }
    
    console.log('Fetch method could not extract Amazon URL, trying other methods...');
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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
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
    
    // Estrategia 3: Buscar cualquier URL de Amazon en el contenido con patrón mejorado
    const amazonUrlMatches = html.match(/https:\/\/(?:www\.)?amazon\.com(?:\.mx)?\/[^\s"'<>]+/ig);
    if (amazonUrlMatches && amazonUrlMatches.length > 0) {
      // Priorizar URLs que parecen de producto (contienen dp/ o gp/product/)
      const productUrlMatch = amazonUrlMatches.find(url => 
        url.includes('/dp/') || url.includes('/gp/product/'));
        
      if (productUrlMatch) {
        amazonUrl = productUrlMatch.replace(/\\/g, '');
        console.log('Found Amazon product URL in HTML content:', amazonUrl);
        console.log('SUCCESS: Found Amazon product URL in HTML content!');
        return amazonUrl;
      } else {
        // Si no hay URL de producto, usar la primera URL de Amazon
        amazonUrl = amazonUrlMatches[0].replace(/\\/g, '');
        console.log('Found Amazon URL in HTML content:', amazonUrl);
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
    
    // Estrategia 5: Extraer ASIN del HTML y construir la URL
    const asinMatch = html.match(/(?:ASIN|asin|productId|product-id|productID)(?:\s*[=:]\s*["']?)([A-Z0-9]{10})["']?/i);
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1];
      console.log('Extracted ASIN from HTML:', asin);
      amazonUrl = `https://www.amazon.com.mx/dp/${asin}`;
      console.log('Constructed Amazon URL from ASIN:', amazonUrl);
      console.log('SUCCESS: Built Amazon URL from ASIN!');
      return amazonUrl;
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
      console.log('This URL should work with the scraper.');
    } else {
      console.log('\nTest failed. Could not resolve URL.');
      console.log('You may need to update User-Agent headers or try a different approach.');
    }
  })
  .catch(error => {
    console.error('\nTest failed with error:', error);
  }); 