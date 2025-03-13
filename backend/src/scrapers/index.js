import axios from 'axios';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15'
];

const COOKIES = {
  'session-id': '123-1234567-1234567',
  'i18n-prefs': 'MXN',
  'ubid-acbmx': '123-1234567-1234567',
  'session-token': '',
  'csm-hit': 'tb:s-XXXXX|1234567890&t:1234567890&adb:adblk_no'
};

// Función para limpiar y normalizar URLs de Amazon
const cleanAmazonUrl = (url) => {
  console.log('Limpiando URL de Amazon:', url);
  
  // Eliminar caracteres no válidos del inicio
  let cleanUrl = url.replace(/^[^a-zA-Z0-9]+/, '');
  
  // Asegurar que comienza con https://
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  // Eliminar slash final si existe
  cleanUrl = cleanUrl.replace(/\/$/, '');
  
  // Extraer el ASIN si está presente en la URL
  let asin = null;
  
  // Patrones comunes para extraer ASIN
  const dpPattern = /\/dp\/([A-Z0-9]{10})/;
  const gppPattern = /\/gp\/product\/([A-Z0-9]{10})/;
  const asinPattern = /\/ASIN\/([A-Z0-9]{10})/;
  
  // Intentar extraer ASIN usando los patrones
  const dpMatch = cleanUrl.match(dpPattern);
  const gppMatch = cleanUrl.match(gppPattern);
  const asinMatch = cleanUrl.match(asinPattern);
  
  if (dpMatch) {
    asin = dpMatch[1];
    console.log('ASIN extraído del patrón dp:', asin);
  } else if (gppMatch) {
    asin = gppMatch[1];
    console.log('ASIN extraído del patrón gp/product:', asin);
  } else if (asinMatch) {
    asin = asinMatch[1];
    console.log('ASIN extraído del patrón ASIN:', asin);
  }
  
  // Si tenemos un ASIN, construir una URL limpia
  if (asin) {
    cleanUrl = `https://www.amazon.com.mx/dp/${asin}`;
    console.log('URL reconstruida con ASIN:', cleanUrl);
  } else {
    // Si no tenemos ASIN, limpiar parámetros de consulta innecesarios
    try {
      const urlObj = new URL(cleanUrl);
      
      // Mantener solo parámetros esenciales
      const essentialParams = ['dp', 'asin', 'gp', 'product'];
      const params = new URLSearchParams();
      
      for (const [key, value] of urlObj.searchParams.entries()) {
        if (essentialParams.includes(key)) {
          params.append(key, value);
        }
      }
      
      // Reconstruir URL con parámetros esenciales
      urlObj.search = params.toString();
      cleanUrl = urlObj.toString();
      console.log('URL limpiada de parámetros innecesarios:', cleanUrl);
    } catch (error) {
      console.error('Error al limpiar parámetros de URL:', error.message);
      // Mantener la URL como está si hay error
    }
  }
  
  return cleanUrl;
};

export async function scrapeAmazonProduct(url) {
  console.log('Starting Amazon scraping for URL:', url);
  
  try {
    // Limpiar y normalizar la URL
    const cleanUrl = cleanAmazonUrl(url);
    console.log('URL limpia para scraping:', cleanUrl);
    
    const config = {
      headers: {
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Cookie': Object.entries(COOKIES).map(([key, value]) => `${key}=${value}`).join('; ')
      },
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Acepta redirecciones
      }
    };

    console.log('Making request with headers:', config.headers);
    const response = await axios.get(cleanUrl, config);
    const html = response.data;
    console.log('Received HTML content length:', html.length);
    
    if (html.includes('Type the characters you see in this image') || 
        html.includes('Enter the characters you see below') ||
        html.includes('Sorry, we just need to make sure you') ||
        html.length < 10000) {
      throw new Error('Amazon está solicitando verificación CAPTCHA. Por favor intenta más tarde.');
    }

    // Extract prices first with more specific patterns
    const currentPrice = extractPrice(html, [
      /class="a-price-whole">([^<]+)<\/span>/,
      /id="priceblock_ourprice"[^>]*>([^<]+)<\/span>/,
      /class="a-offscreen">([^<]+)<\/span>/,
      /class="a-price aok-align-center"[^>]*>.*?<span class="a-price-whole">([^<]+)<\/span>/s,
      /id="corePrice_feature_div"[^>]*>.*?class="a-offscreen">([^<]+)<\/span>/s,
      /"price":{"value":([^,]+),/
    ]);

    const originalPrice = extractPrice(html, [
      /class="a-price a-text-price"[^>]*>.*?<span>([^<]+)<\/span>/s,
      /class="a-text-strike">([^<]+)<\/span>/,
      /class="a-price a-text-price a-size-base"[^>]*>.*?<span>([^<]+)<\/span>/s,
      /"strikePrice":{"value":([^,]+),/
    ]);

    // Extract product data with improved patterns
    const productData = {
      title: extractData(html, [
        /<span id="productTitle"[^>]*>([^<]+)<\/span>/,
        /<h1[^>]*class="[^"]*a-spacing-none[^"]*"[^>]*>([^<]+)<\/h1>/,
        /"title":"([^"]+)"/
      ]),
      price: currentPrice,
      originalPrice: originalPrice,
      discount: originalPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0,
      image: extractData(html, [
        /"large":"([^"]+)"/,
        /id="landingImage"[^>]+src="([^"]+)"/,
        /class="a-dynamic-image"[^>]+src="([^"]+)"/,
        /data-old-hires="([^"]+)"/,
        /data-a-dynamic-image="([^"]+)"/,
        /"image":"([^"]+)"/,
        /"imageUrl":"([^"]+)"/
      ]),
      description: extractDescription(html),
      features: extractFeatures(html),
      availability: extractData(html, [
        /id="availability"[^>]*>([^<]+)<\/span>/,
        /class="a-size-medium a-color-success"[^>]*>([^<]+)<\/span>/,
        /"availability":"([^"]+)"/
      ]),
      rating: extractData(html, [
        /class="a-icon-alt">([^<]+)<\/span>/,
        /id="acrPopover"[^>]*title="([^"]+)"/,
        /"rating":([^,]+),/
      ]),
      seller: extractData(html, [
        /id="merchant-info"[^>]*>([^<]+)<\/div>/,
        /id="sellerProfileTriggerId"[^>]*>([^<]+)<\/a>/,
        /"seller":"([^"]+)"/
      ]),
      warranty: extractData(html, [
        /class="a-row warranty"[^>]*>([^<]+)<\/div>/
      ]),
      url: cleanUrl
    };

    console.log('Successfully extracted product data:', productData);
    
    if (!productData.title && !productData.price) {
      console.error('HTML Content Preview:', html.substring(0, 500));
      throw new Error('No se pudieron extraer los datos principales del producto. Es posible que Amazon esté bloqueando el acceso.');
    }

    return productData;
  } catch (error) {
    console.error('Error scraping Amazon:', error.message);
    console.error('Full error:', error);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
    }
    
    throw new Error(`Error al obtener información del producto: ${error.message}`);
  }
}

function extractFeatures(html) {
  const featureMatch = html.match(/id="feature-bullets"[^>]*>(.*?)<\/div>/s);
  if (!featureMatch) return [];

  const featureText = featureMatch[1];
  const features = featureText.match(/<li[^>]*><span[^>]*>([^<]+)<\/span><\/li>/g) || [];
  
  return features.map(feature => {
    const match = feature.match(/<span[^>]*>([^<]+)<\/span>/);
    return match ? match[1].trim() : '';
  }).filter(Boolean);
}

function extractData(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function extractPrice(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      // Remove currency symbols and convert to proper format
      const priceText = match[1].trim();
      // Remove everything except digits, dots and commas
      const cleanPrice = priceText
        .replace(/[^\d.,]/g, '')
        .replace(/,(\d{3})/g, '$1') // Remove thousands separators
        .replace(/[.,](\d{2})$/, '.$1'); // Ensure proper decimal format
      
      const price = parseFloat(cleanPrice);
      if (!isNaN(price)) {
        return price;
      }
    }
  }
  return null;
}

function extractDescription(html) {
  const patterns = [
    /id="feature-bullets"[^>]*>(.*?)<\/div>/s,
    /id="productDescription"[^>]*>(.*?)<\/div>/s,
    /class="a-spacing-small[^>]*>(.*?)<\/div>/s
  ];
  
  const description = extractData(html, patterns);
  return description
    ? description
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
    : '';
}

export async function scrapeMercadoLibreProduct(url) {
  console.log('Starting MercadoLibre scraping for URL:', url);
  
  try {
    const config = {
      headers: {
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document'
      },
      timeout: 30000,
      maxRedirects: 5
    };

    const response = await axios.get(url, config);
    const html = response.data;
    console.log('Received HTML content length:', html.length);

    // Extract prices with more specific patterns for MercadoLibre
    const currentPrice = extractPrice(html, [
      // Patrones para el precio con descuento
      /data-price="([^"]+)"/,
      /class="andes-money-amount ui-pdp-price__part andes-money-amount--cents-superscript andes-money-amount--compact".*?class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/s,
      /class="ui-pdp-price__second-line".*?class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/s,
      /class="price-tag-amount".*?class="price-tag-fraction"[^>]*>([^<]+)<\/span>/s,
      /"price":([^,]+),/
    ]);

    const originalPrice = extractPrice(html, [
      // Patrones para el precio original
      /class="ui-pdp-price__original-value".*?class="andes-money-amount__fraction"[^>]*>([^<]+)<\/span>/s,
      /class="price-tag-amount".*?class="price-tag-fraction-old"[^>]*>([^<]+)<\/span>/s,
      /data-original-price="([^"]+)"/,
      /"original_price":([^,]+),/,
      /class="price-tag__del".*?class="price-tag-fraction"[^>]*>([^<]+)<\/span>/s
    ]);

    // Extract and clean image URL
    let imageUrl = extractData(html, [
      /class="ui-pdp-gallery__figure"[^>]+data-zoom="([^"]+)"/,
      /class="ui-pdp-image"[^>]+src="([^"]+)"/,
      /"image":"([^"]+)"/,
      /data-full-image="([^"]+)"/,
      /data-zoom="([^"]+)"/
    ]);

    // Clean the image URL by removing escape characters
    imageUrl = imageUrl
      .replace(/\\u002F/g, '/') // Replace \u002F with /
      .replace(/\\u002f/g, '/') // Replace \u002f with /
      .replace(/\\\//g, '/') // Replace \/ with /
      .replace(/^\/\//, 'https://'); // Add https:// if URL starts with //

    const productData = {
      title: extractData(html, [
        /class="ui-pdp-title"[^>]*>([^<]+)<\/h1>/,
        /class="item-title"[^>]*>([^<]+)<\/span>/,
        /"name":"([^"]+)"/
      ]),
      price: currentPrice,
      originalPrice: originalPrice,
      discount: originalPrice && currentPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0,
      image: imageUrl,
      description: extractDescription(html),
      condition: extractData(html, [
        /class="ui-pdp-subtitle"[^>]*>([^<]+)<\/p>/,
        /class="item-conditions"[^>]*>([^<]+)<\/div>/,
        /"condition":"([^"]+)"/
      ]),
      seller: extractData(html, [
        /class="ui-pdp-seller__link-trigger"[^>]*>([^<]+)<\/span>/,
        /class="store-info"[^>]*>([^<]+)<\/div>/,
        /"seller_name":"([^"]+)"/
      ]),
      warranty: extractData(html, [
        /class="ui-pdp-warranty"[^>]*>([^<]+)<\/p>/,
        /class="warranty-text"[^>]*>([^<]+)<\/div>/
      ]),
      features: extractMercadoLibreFeatures(html),
      stock: extractData(html, [
        /class="ui-pdp-stock"[^>]*>([^<]+)<\/p>/,
        /class="ui-pdp-buybox__quantity__available"[^>]*>([^<]+)<\/span>/,
        /class="stock-information"[^>]*>([^<]+)<\/div>/,
        /"available_quantity":([^,]+),/
      ]),
      shipping: extractData(html, [
        /class="ui-pdp-media__title"[^>]*>([^<]+)<\/span>/,
        /class="shipping-method-title"[^>]*>([^<]+)<\/div>/,
        /"shipping_mode":"([^"]+)"/
      ]),
      rating: extractData(html, [
        /class="ui-pdp-reviews__rating__summary__average"[^>]*>([^<]+)<\/p>/,
        /class="review-summary-average"[^>]*>([^<]+)<\/div>/,
        /"rating_average":([^,]+),/
      ]),
      url
    };

    console.log('Successfully extracted product data:', productData);
    
    if (!productData.title || !productData.price) {
      console.error('HTML Content Preview:', html.substring(0, 500));
      throw new Error('No se pudieron extraer los datos principales del producto');
    }

    return productData;
  } catch (error) {
    console.error('Error scraping MercadoLibre:', error.message);
    console.error('Full error:', error);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
    }
    
    throw new Error(`Error al obtener información del producto: ${error.message}`);
  }
}

function extractMercadoLibreFeatures(html) {
  const featureMatch = html.match(/class="ui-pdp-features"[^>]*>(.*?)<\/div>/s);
  if (!featureMatch) return [];

  const featureText = featureMatch[1];
  const features = featureText.match(/<p[^>]*>([^<]+)<\/p>/g) || [];
  
  return features.map(feature => {
    const match = feature.match(/>([^<]+)</);
    return match ? match[1].trim() : '';
  }).filter(Boolean);
}

export async function scrapeLiverpoolProduct(url) {
  console.log('Starting Liverpool scraping for URL:', url);
  
  try {
    const config = {
      headers: {
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'Upgrade-Insecure-Requests': '1',
        'Cookie': 'JSESSIONID=dummy; visitorId=dummy'
      },
      timeout: 30000,
      maxRedirects: 5
    };

    const response = await axios.get(url, config);
    const html = response.data;
    console.log('Received HTML content length:', html.length);

    const productData = {
      title: extractData(html, [
        /<h1[^>]*class="[^"]*product-name[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /<h1[^>]*class="[^"]*a-product-name[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /<div[^>]*class="[^"]*product-title[^"]*"[^>]*>([^<]+)<\/div>/i,
        /<div[^>]*class="[^"]*product-header[^"]*"[^>]*>([^<]+)<\/div>/i,
        /"name":"([^"]+)"/
      ]),
      price: extractPrice(html, [
        /<span[^>]*class="[^"]*a-price[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<span[^>]*class="[^"]*product-price[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*price-box[^"]*"[^>]*>([^<]+)<\/div>/i,
        /"price":([^,]+),/
      ]),
      originalPrice: extractPrice(html, [
        /<span[^>]*class="[^"]*original-price[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<span[^>]*class="[^"]*was-price[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*original-price[^"]*"[^>]*>([^<]+)<\/div>/i,
        /"originalPrice":([^,]+),/
      ]),
      image: extractData(html, [
        /<img[^>]*class="[^"]*product-image[^"]*"[^>]+src="([^"]+)"/i,
        /<img[^>]*id="[^"]*product-image[^"]*"[^>]+src="([^"]+)"/i,
        /"image":"([^"]+)"/
      ]),
      description: extractDescription(html),
      features: extractFeatures(html),
      availability: extractData(html, [
        /<span[^>]*class="[^"]*stock-status[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*availability[^"]*"[^>]*>([^<]+)<\/div>/i,
        /"availability":"([^"]+)"/
      ]),
      url: url
    };

    if (!productData.title || !productData.price) {
      console.error('Failed to extract essential product data from Liverpool');
      throw new Error('No se pudieron extraer los datos principales del producto');
    }

    console.log('Successfully extracted product data:', productData);
    return productData;
  } catch (error) {
    console.error('Error scraping Liverpool:', error);
    throw new Error(`Error al obtener información del producto: ${error.message}`);
  }
}

export async function scrapeWalmartProduct(url) {
  console.log('Starting Walmart scraping for URL:', url);
  
  try {
    const config = {
      headers: {
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'Upgrade-Insecure-Requests': '1',
        'Cookie': 'vtc=dummy; com.wm.reflector=reflectorid:dummy; type=temporary; walmart.nearestPostalCode=dummy; walmart.nearestLatLng=dummy',
        'Referer': 'https://www.walmart.com.mx/',
        'Origin': 'https://www.walmart.com.mx'
      },
      timeout: 30000,
      maxRedirects: 5
    };

    const response = await axios.get(url, config);
    const html = response.data;
    console.log('Received HTML content length:', html.length);

    // Extract JSON data if available
    let jsonData = null;
    const jsonMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/i);
    if (jsonMatch) {
      try {
        jsonData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.log('Failed to parse JSON data:', e);
      }
    }

    const productData = {
      title: extractData(html, [
        /<h1[^>]*class="[^"]*product-name[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /<h1[^>]*class="[^"]*prod-title[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /<div[^>]*class="[^"]*product-title[^"]*"[^>]*>([^<]+)<\/div>/i,
        /<div[^>]*class="[^"]*heading[^"]*"[^>]*>([^<]+)<\/div>/i,
        jsonData?.name ? () => jsonData.name : null
      ].filter(Boolean)),
      price: extractPrice(html, [
        /<span[^>]*class="[^"]*price-characteristic[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<span[^>]*class="[^"]*current-price[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*product-price[^"]*"[^>]*>([^<]+)<\/div>/i,
        /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/span>/i,
        jsonData?.offers?.price ? () => jsonData.offers.price : null
      ].filter(Boolean)),
      originalPrice: extractPrice(html, [
        /<span[^>]*class="[^"]*list-price[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<span[^>]*class="[^"]*strike-through[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*original-price[^"]*"[^>]*>([^<]+)<\/div>/i,
        /<span[^>]*class="[^"]*was-price[^"]*"[^>]*>([^<]+)<\/span>/i
      ]),
      image: extractData(html, [
        /<img[^>]*class="[^"]*product-image[^"]*"[^>]+src="([^"]+)"/i,
        /<img[^>]*class="[^"]*prod-image[^"]*"[^>]+src="([^"]+)"/i,
        /<img[^>]*class="[^"]*main-image[^"]*"[^>]+src="([^"]+)"/i,
        jsonData?.image ? () => jsonData.image : null
      ].filter(Boolean)),
      description: jsonData?.description || extractDescription(html),
      features: extractFeatures(html),
      availability: extractData(html, [
        /<div[^>]*class="[^"]*availability[^"]*"[^>]*>([^<]+)<\/div>/i,
        /<span[^>]*class="[^"]*stock-status[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*inventory[^"]*"[^>]*>([^<]+)<\/div>/i,
        jsonData?.offers?.availability ? () => jsonData.offers.availability : null
      ].filter(Boolean)) || 'Disponible',
      seller: extractData(html, [
        /<span[^>]*class="[^"]*seller-name[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*vendor[^"]*"[^>]*>([^<]+)<\/div>/i,
        jsonData?.seller?.name ? () => jsonData.seller.name : null
      ].filter(Boolean)) || 'Walmart',
      url: url
    };

    if (!productData.title || !productData.price) {
      console.error('Failed to extract essential product data from Walmart');
      console.error('HTML Content Preview:', html.substring(0, 1000));
      throw new Error('No se pudieron extraer los datos principales del producto');
    }

    // Calculate discount if both prices are available
    if (productData.originalPrice && productData.price) {
      productData.discount = Math.round((1 - productData.price / productData.originalPrice) * 100);
    }

    console.log('Successfully extracted product data:', productData);
    return productData;
  } catch (error) {
    console.error('Error scraping Walmart:', error);
    throw new Error(`Error al obtener información del producto: ${error.message}`);
  }
}

export async function scrapePalacioHierroProduct(url) {
  console.log('Starting Palacio de Hierro scraping for URL:', url);
  
  try {
    const config = {
      headers: {
        'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'Upgrade-Insecure-Requests': '1',
        'Cookie': 'dwsid=dummy; dwanonymous_dummy; dwac_dummy'
      },
      timeout: 30000,
      maxRedirects: 5
    };

    const response = await axios.get(url, config);
    const html = response.data;
    console.log('Received HTML content length:', html.length);

    const productData = {
      title: extractData(html, [
        /<h1[^>]*class="[^"]*pdp-title[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /<h1[^>]*class="[^"]*product-name[^"]*"[^>]*>([^<]+)<\/h1>/i,
        /<div[^>]*class="[^"]*product-title[^"]*"[^>]*>([^<]+)<\/div>/i,
        /"name":"([^"]+)"/
      ]),
      price: extractPrice(html, [
        /<span[^>]*class="[^"]*sales[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<span[^>]*class="[^"]*price-sales[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*product-price[^"]*"[^>]*>([^<]+)<\/div>/i,
        /"price":([^,]+),/
      ]),
      originalPrice: extractPrice(html, [
        /<span[^>]*class="[^"]*standard-price[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<span[^>]*class="[^"]*price-standard[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*original-price[^"]*"[^>]*>([^<]+)<\/div>/i,
        /"originalPrice":([^,]+),/
      ]),
      image: extractData(html, [
        /<img[^>]*class="[^"]*primary-image[^"]*"[^>]+src="([^"]+)"/i,
        /<img[^>]*class="[^"]*product-image[^"]*"[^>]+src="([^"]+)"/i,
        /"image":"([^"]+)"/
      ]),
      description: extractDescription(html),
      features: extractFeatures(html),
      availability: extractData(html, [
        /<span[^>]*class="[^"]*availability[^"]*"[^>]*>([^<]+)<\/span>/i,
        /<div[^>]*class="[^"]*stock-status[^"]*"[^>]*>([^<]+)<\/div>/i,
        /"availability":"([^"]+)"/
      ]),
      url: url
    };

    if (!productData.title || !productData.price) {
      console.error('Failed to extract essential product data from Palacio de Hierro');
      throw new Error('No se pudieron extraer los datos principales del producto');
    }

    console.log('Successfully extracted product data:', productData);
    return productData;
  } catch (error) {
    console.error('Error scraping Palacio de Hierro:', error);
    throw new Error(`Error al obtener información del producto: ${error.message}`);
  }
} 