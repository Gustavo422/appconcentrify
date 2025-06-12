const session = require('express-session');
const config = require('../config/config');

/**
 * Configurar middleware de sessão
 */
const setupSession = function(app) {
  const sessionConfig = {
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: config.SESSION_MAX_AGE,
      sameSite: 'lax',
    },
    name: 'concentrify.sid',
    // Adicionar configurações para evitar problemas
    rolling: true, // Renovar sessão a cada requisição
    unset: 'destroy', // Destruir sessão quando unset
  };

  // Em produção, usar store de sessão mais robusto
  if (config.NODE_ENV === 'production') {
    // Aqui você pode configurar um store como Redis ou PostgreSQL
    // const RedisStore = require('connect-redis')(session);
    // sessionConfig.store = new RedisStore({ client: redisClient });
  }

  app.use(session(sessionConfig));

  // Middleware para log de sessão (apenas em desenvolvimento)
  if (config.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log('Sessão:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        hasUser: !!req.session?.user,
        path: req.path,
      });
      next();
    });
  }
};

module.exports = {
  setupSession,
};
