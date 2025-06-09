const session = require('express-session');
const config = require('../config/config');

/**
 * Configurar middleware de sessão
 */
function setupSession(app) {
  const sessionConfig = {
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: config.SESSION_MAX_AGE,
      sameSite: 'lax'
    },
    name: 'concentrify.sid'
  };

  // Em produção, usar store de sessão mais robusto
  if (config.NODE_ENV === 'production') {
    // Aqui você pode configurar um store como Redis ou PostgreSQL
    // const RedisStore = require('connect-redis')(session);
    // sessionConfig.store = new RedisStore({ client: redisClient });
  }

  app.use(session(sessionConfig));
}

module.exports = {
  setupSession
};