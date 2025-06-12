const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const rateLimit = require('express-rate-limit');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
require('dotenv').config();

// Importar configurações e middlewares
const appConfig = require('./config/app');
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
app.use(helmet(appConfig.security.helmet));

// CORS
app.use(cors(appConfig.security.cors));

// Compressão
if (appConfig.compression.enabled) {
  app.use(compression({ level: appConfig.compression.level }));
}

// Rate limiting
const limiter = rateLimit(appConfig.security.rateLimit);
app.use(limiter);

// Logging
if (appConfig.logging.enabled) {
  app.use(morgan(appConfig.logging.format));
}

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Method override para PUT/DELETE em formulários HTML
app.use(methodOverride('_method'));

// Configurar sessões
setupSession(app, appConfig.session);
app.use(flash());

// Arquivos estáticos
app.use(express.static(appConfig.staticFiles.publicPath));
app.use('/uploads', express.static(appConfig.staticFiles.uploadsPath));

// View engine
app.set('view engine', appConfig.viewEngine.engine);
app.set('views', appConfig.viewEngine.viewsPath);

// Configurar layouts
app.use(expressLayouts);
app.set('layout', appConfig.viewEngine.layout);
app.set('layout extractScripts', appConfig.viewEngine.layoutExtractScripts);
app.set('layout extractStyles', appConfig.viewEngine.layoutExtractStyles);

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
const PORT = appConfig.port;
const HOST = appConfig.host;

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`📊 Ambiente: ${appConfig.nodeEnv}`);
  console.log('🗄️  Banco: Supabase');
});

module.exports = app;
