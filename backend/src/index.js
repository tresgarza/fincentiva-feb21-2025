import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { scrapeAmazonProduct, scrapeMercadoLibreProduct, scrapeLiverpoolProduct, scrapeWalmartProduct, scrapePalacioHierroProduct } from './scrapers/index.js';
import companyRoutes from './routes/company.routes.js';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://fincentiva-feb21-2025.vercel.app',
  'https://fincentiva-feb21-2025-front.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 600 // Cache preflight requests for 10 minutes
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Fincentest API is running',
    version: '1.0.0',
    endpoints: {
      '/api/companies': 'Company management endpoints',
      '/api/product/info': 'Product information scraping endpoint',
      '/health': 'Health check endpoint'
    }
  });
});

// Routes
app.post('/api/product/info', async (req, res) => {
  console.log('Received product info request:', req.body);
  
  try {
    const { url } = req.body;

    if (!url) {
      console.log('Missing URL in request');
      return res.status(400).json({ error: 'URL es requerida' });
    }

    let productData;
    console.log('Processing URL:', url);

    // Normalizar la URL: eliminar espacios, asegurar https://
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl;
      console.log('Normalized URL to include https://', normalizedUrl);
    }

    // Manejar enlaces acortados de Amazon (a.co)
    if (normalizedUrl.includes('a.co')) {
      console.log('Detected Amazon shortened URL, resolving to full URL...');
      try {
        // SOLUCIÓN MÁS SIMPLE Y DIRECTA: usar fetch para seguir redirecciones
        // Probamos con esto primero ya que axios puede tener problemas con algunas redirecciones
        try {
          console.log('Attempting to resolve with fetch API...');
          const fetchResponse = await fetch(normalizedUrl, {
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
          
          // Obtener la URL final después de las redirecciones
          const fullUrl = fetchResponse.url;
          console.log('Resolved short URL with fetch to:', fullUrl);
          
          if (fullUrl && (fullUrl.includes('amazon.com.mx') || fullUrl.includes('amazon.com'))) {
            console.log('Confirmed Amazon URL after resolution, starting scraper...');
            productData = await scrapeAmazonProduct(fullUrl);
            // Si llegamos aquí, todo fue exitoso, así que salimos
            console.log('Successfully processed product with fetch method');
            res.json(productData);
            return;
          } else {
            // Si fetch no resolvió a una URL de Amazon, intentar extraer de la respuesta HTML
            console.log('Fetch resolved URL is not from Amazon. Attempting to extract from HTML...');
            const htmlContent = await fetchResponse.text();
            
            // Buscar posible URL de Amazon en el HTML con un patrón más amplio
            const amazonUrlMatches = htmlContent.match(/https:\/\/(?:www\.)?amazon\.com(?:\.mx)?\/[^\s"'<>]+/ig);
            if (amazonUrlMatches && amazonUrlMatches.length > 0) {
              // Priorizar URLs que parecen de producto (contienen dp/ o gp/product/)
              const productUrlMatch = amazonUrlMatches.find(url => 
                url.includes('/dp/') || url.includes('/gp/product/'));
                
              if (productUrlMatch) {
                const extractedUrl = productUrlMatch.replace(/\\/g, '');
                console.log('Found Amazon product URL in HTML:', extractedUrl);
                
                console.log('Starting scraper with extracted product URL...');
                productData = await scrapeAmazonProduct(extractedUrl);
                console.log('Successfully processed product with extracted URL');
                res.json(productData);
                return;
              } else {
                // Si no hay URL de producto, usar la primera URL de Amazon
                const extractedUrl = amazonUrlMatches[0].replace(/\\/g, '');
                console.log('Found general Amazon URL in HTML:', extractedUrl);
                
                console.log('Starting scraper with extracted general URL...');
                productData = await scrapeAmazonProduct(extractedUrl);
                console.log('Successfully processed product with extracted URL');
                res.json(productData);
                return;
              }
            }
            
            // Buscar ASIN directamente en el HTML
            const asinMatch = htmlContent.match(/(?:ASIN|asin|productId|product-id|productID)(?:\s*[=:]\s*["']?)([A-Z0-9]{10})["']?/i);
            if (asinMatch && asinMatch[1]) {
              const asin = asinMatch[1];
              console.log('Extracted ASIN from HTML:', asin);
              const amazonUrl = `https://www.amazon.com.mx/dp/${asin}`;
              console.log('Constructed Amazon URL from ASIN:', amazonUrl);
              
              console.log('Starting scraper with constructed ASIN URL...');
              productData = await scrapeAmazonProduct(amazonUrl);
              console.log('Successfully processed product with ASIN URL');
              res.json(productData);
              return;
            }
          }
        } catch (fetchError) {
          console.error('Error resolving with fetch:', fetchError);
          console.log('Falling back to axios method...');
        }
        
        // MÉTODO ALTERNATIVO: Si fetch falla, intentamos con axios
        const axiosResponse = await axios.get(normalizedUrl, {
          maxRedirects: 15,
          timeout: 15000,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Acepta redirecciones
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        // Buscar en el HTML para encontrar el enlace de Amazon
        const html = axiosResponse.data;
        console.log('Analyzing HTML content to find Amazon link...');
        
        // Métodos para encontrar la URL de Amazon en el HTML
        let fullUrl = '';
        
        // 1. Buscar URL canónica
        const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/i);
        if (canonicalMatch && canonicalMatch[1]) {
          fullUrl = canonicalMatch[1];
          console.log('Found canonical URL:', fullUrl);
        }
        
        // 2. Buscar redireccionamiento en meta tags
        if (!fullUrl || !fullUrl.includes('amazon')) {
          const metaRedirectMatch = html.match(/<meta http-equiv="refresh" content="[^"]*url=([^"]+)"/i);
          if (metaRedirectMatch && metaRedirectMatch[1]) {
            fullUrl = metaRedirectMatch[1];
            console.log('Found meta redirect URL:', fullUrl);
          }
        }
        
        // 3. Buscar en el texto del HTML alguna URL de Amazon
        if (!fullUrl || !fullUrl.includes('amazon')) {
          // Patrón más amplio para capturar URLs de Amazon
          const amazonUrlMatches = html.match(/https:\/\/(?:www\.)?amazon\.com(?:\.mx)?\/[^\s"'<>]+/ig);
          if (amazonUrlMatches && amazonUrlMatches.length > 0) {
            // Priorizar URLs que parecen de producto (contienen dp/ o gp/product/)
            const productUrlMatch = amazonUrlMatches.find(url => 
              url.includes('/dp/') || url.includes('/gp/product/'));
              
            if (productUrlMatch) {
              fullUrl = productUrlMatch.replace(/\\/g, '');
              console.log('Found Amazon product URL in HTML content:', fullUrl);
            } else {
              // Si no hay URL de producto, usar la primera URL de Amazon
              fullUrl = amazonUrlMatches[0].replace(/\\/g, '');
              console.log('Found Amazon URL in HTML content:', fullUrl);
            }
          }
        }
        
        // 4. Intenta obtener la URL de respuesta de axios
        if (!fullUrl || !fullUrl.includes('amazon')) {
          if (axiosResponse.request && axiosResponse.request.res && axiosResponse.request.res.responseUrl) {
            fullUrl = axiosResponse.request.res.responseUrl;
            console.log('Using axios responseUrl:', fullUrl);
          }
        }
        
        // 5. Último recurso: extraer ASIN y construir URL manualmente
        if (!fullUrl || !fullUrl.includes('amazon')) {
          const asinMatch = html.match(/(?:ASIN|asin|productId|product-id|productID)(?:\s*[=:]\s*["']?)([A-Z0-9]{10})["']?/i);
          if (asinMatch && asinMatch[1]) {
            const asin = asinMatch[1];
            console.log('Extracted ASIN from HTML:', asin);
            fullUrl = `https://www.amazon.com.mx/dp/${asin}`;
            console.log('Constructed Amazon URL from ASIN:', fullUrl);
          }
        }
        
        // Si encontramos una URL de Amazon, intentar scraping
        if (fullUrl && (fullUrl.includes('amazon.com.mx') || fullUrl.includes('amazon.com'))) {
          console.log('Found Amazon URL through alternative methods, starting scraper...');
          productData = await scrapeAmazonProduct(fullUrl);
          console.log('Successfully processed product with alternative methods');
          res.json(productData);
          return;
        }
        
        // Si llegamos aquí es porque no pudimos encontrar una URL de Amazon válida
        console.error('Failed to resolve Amazon shortened URL to a valid product URL');
        return res.status(400).json({ error: 'No se pudo resolver el enlace acortado de Amazon a un producto válido. Por favor intenta con la URL completa del producto.' });
      } catch (error) {
        console.error('Error processing Amazon short URL:', error);
        return res.status(500).json({ error: `Error al procesar el enlace acortado de Amazon: ${error.message}` });
      }
    } else if (normalizedUrl.includes('amazon.com.mx') || normalizedUrl.includes('amazon.com')) {
      console.log('Detected Amazon URL, starting scraper...');
      productData = await scrapeAmazonProduct(normalizedUrl);
    } else if (normalizedUrl.includes('mercadolibre.com.mx')) {
      console.log('Detected MercadoLibre URL, starting scraper...');
      productData = await scrapeMercadoLibreProduct(normalizedUrl);
    } else if (normalizedUrl.includes('liverpool.com.mx')) {
      console.log('Detected Liverpool URL, starting scraper...');
      productData = await scrapeLiverpoolProduct(normalizedUrl);
    } else if (normalizedUrl.includes('walmart.com.mx')) {
      console.log('Detected Walmart URL, starting scraper...');
      productData = await scrapeWalmartProduct(normalizedUrl);
    } else if (normalizedUrl.includes('elpalaciodehierro.com')) {
      console.log('Detected Palacio de Hierro URL, starting scraper...');
      productData = await scrapePalacioHierroProduct(normalizedUrl);
    } else {
      console.log('Unsupported URL domain');
      return res.status(400).json({ 
        error: 'URL no soportada',
        message: 'Por favor ingresa una URL de Amazon, MercadoLibre, Liverpool, Walmart o El Palacio de Hierro'
      });
    }

    console.log('Successfully processed product:', productData);
    res.json(productData);
  } catch (error) {
    console.error('Detailed error processing product URL:', error);
    res.status(500).json({ 
      error: 'Error al procesar el producto',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/companies', companyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

const findAvailablePort = async (startPort) => {
  const net = await import('net');
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

// Start server with port fallback
const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(port);
    const server = app.listen(availablePort, () => {
      console.log(`Server running on port ${availablePort}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'https://fincentiva-feb21-2025.vercel.app'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 