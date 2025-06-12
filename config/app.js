const path = require('path');
const { CONFIG } = require('../src/constants');

/**
 * Configurações centralizadas da aplicação
 * Segue o princípio Single Responsibility
 */

const appConfig = {
  // Configurações básicas
  port: CONFIG.PORT,
  host: CONFIG.HOST,
  nodeEnv: CONFIG.NODE_ENV,

  // Configurações de sessão
  session: {
    secret: process.env.SESSION_SECRET || 'concentrify-secret-key',
    name: 'concentrify.sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: CONFIG.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  },

  // Configurações de segurança
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdnjs.cloudflare.com',
            'https://fonts.googleapis.com',
          ],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://cdnjs.cloudflare.com',
          ],
          fontSrc: [
            "'self'",
            'https://fonts.gstatic.com',
            'https://cdnjs.cloudflare.com',
          ],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          connectSrc: ["'self'", process.env.SUPABASE_URL],
        },
      },
    },
    cors: {
      origin:
        CONFIG.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
      credentials: true,
    },
    rateLimit: {
      windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
      max: CONFIG.RATE_LIMIT_MAX_REQUESTS,
      message: {
        error: 'Muitas tentativas. Tente novamente em alguns minutos.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    },
  },

  // Configurações de upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
    uploadPath: path.join(__dirname, '../uploads'),
  },

  // Configurações de view engine
  viewEngine: {
    engine: 'ejs',
    viewsPath: path.join(__dirname, '../views'),
    layout: 'layouts/main',
    layoutExtractScripts: true,
    layoutExtractStyles: true,
  },

  // Configurações de arquivos estáticos
  staticFiles: {
    publicPath: path.join(__dirname, '../public'),
    uploadsPath: path.join(__dirname, '../uploads'),
  },

  // Configurações de logging
  logging: {
    enabled: CONFIG.NODE_ENV !== 'test',
    format: 'combined',
  },

  // Configurações de compressão
  compression: {
    enabled: true,
    level: 6,
  },
};

module.exports = appConfig;
