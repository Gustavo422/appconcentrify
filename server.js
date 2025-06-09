const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configurações e middlewares
const config = require('./config/config');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { setupSession } = require('./middleware/sessionMiddleware');

// Importar rotas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productsRoutes = require('./routes/products');
const simuladosRoutes = require('./routes/simulados');
const macetesRoutes = require('./routes/macetes');
const questoesSemanaisRoutes = require('./routes/questoesSemanais');

const app = express();

// Configurações de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.SUPABASE_URL]
    }
  }
}));

// CORS
app.use(cors({
  origin: config.NODE_ENV === 'production' ? config.FRONTEND_URL : true,
  credentials: true
}));

// Compressão
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Configurar sessões
setupSession(app);
app.use(flash());

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware global para templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.user?.is_admin || false;
  res.locals.messages = req.flash();
  res.locals.currentPath = req.path;
  next();
});

// Rotas
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/products', productsRoutes);
app.use('/simulados', simuladosRoutes);
app.use('/macetes', macetesRoutes);
app.use('/questoes-semanais', questoesSemanaisRoutes);

// Rota principal
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/products');
  }
  res.redirect('/auth/login');
});

// Middleware de erro
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const PORT = config.PORT || 3000;
const HOST = config.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`📊 Ambiente: ${config.NODE_ENV}`);
  console.log(`🗄️  Banco: Supabase`);
});

module.exports = app;