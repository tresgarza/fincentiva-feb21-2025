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

    // Manejar enlaces acortados de Amazon (a.co)
    if (url.includes('a.co')) {
      console.log('Detected Amazon shortened URL, resolving to full URL...');
      try {
        // Configuración para seguir redirecciones
        const response = await axios.head(url, {
          maxRedirects: 10,
          timeout: 10000,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Acepta redirecciones
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
          }
        });
        
        // Obtener la URL final después de las redirecciones
        let fullUrl = '';
        
        // Diferentes formas de obtener la URL final dependiendo de la versión de Axios
        if (response.request && response.request.res && response.request.res.responseUrl) {
          fullUrl = response.request.res.responseUrl;
        } else if (response.request && response.request.res && response.request.res.req && response.request.res.req.path) {
          fullUrl = response.request.res.req.path;
        } else if (response.request && response.request.path) {
          fullUrl = response.request.path;
        } else if (response.request && response.request.responseURL) {
          fullUrl = response.request.responseURL;
        }
        
        console.log('Resolved short URL to:', fullUrl);
        
        // Si no pudimos resolver la URL, intentar un método alternativo
        if (!fullUrl || !fullUrl.includes('amazon')) {
          console.log('Failed to resolve URL with HEAD request, trying GET request...');
          
          // Intentar con una solicitud GET completa
          const getResponse = await axios.get(url, {
            maxRedirects: 10,
            timeout: 10000,
            validateStatus: function (status) {
              return status >= 200 && status < 400; // Acepta redirecciones
            },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
            }
          });
          
          // Buscar URL canónica en el HTML
          const html = getResponse.data;
          const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/i);
          if (canonicalMatch && canonicalMatch[1]) {
            fullUrl = canonicalMatch[1];
            console.log('Found canonical URL:', fullUrl);
          } else if (getResponse.request && getResponse.request.res && getResponse.request.res.responseUrl) {
            fullUrl = getResponse.request.res.responseUrl;
            console.log('Using responseUrl from GET request:', fullUrl);
          }
        }
        
        // Verificar si la URL resuelta es de Amazon
        if (fullUrl && (fullUrl.includes('amazon.com.mx') || fullUrl.includes('amazon.com'))) {
          console.log('Confirmed Amazon URL after resolution, starting scraper...');
          productData = await scrapeAmazonProduct(fullUrl);
        } else {
          console.log('Unable to resolve to valid Amazon URL:', fullUrl);
          return res.status(400).json({
            error: 'URL no soportada después de resolver el enlace corto',
            message: 'El enlace acortado no lleva a un producto de Amazon válido o no se pudo resolver correctamente'
          });
        }
      } catch (error) {
        console.error('Error resolving shortened URL:', error);
        return res.status(500).json({
          error: 'Error al resolver el enlace acortado',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }
    } else if (url.includes('amazon.com.mx') || url.includes('amazon.com')) {
      console.log('Detected Amazon URL, starting scraper...');
      productData = await scrapeAmazonProduct(url);
    } else if (url.includes('mercadolibre.com.mx')) {
      console.log('Detected MercadoLibre URL, starting scraper...');
      productData = await scrapeMercadoLibreProduct(url);
    } else if (url.includes('liverpool.com.mx')) {
      console.log('Detected Liverpool URL, starting scraper...');
      productData = await scrapeLiverpoolProduct(url);
    } else if (url.includes('walmart.com.mx')) {
      console.log('Detected Walmart URL, starting scraper...');
      productData = await scrapeWalmartProduct(url);
    } else if (url.includes('elpalaciodehierro.com')) {
      console.log('Detected Palacio de Hierro URL, starting scraper...');
      productData = await scrapePalacioHierroProduct(url);
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