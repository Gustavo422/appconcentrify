require('dotenv').config();

const config = {
  // Configurações do servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  HOST: process.env.HOST || 'localhost',
  
  // Configurações de segurança
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback-session-secret',
  
  // Configurações do Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Configurações de upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 16777216, // 16MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // Configurações de rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Configurações de sessão
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 horas
  
  // Configurações de logs
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/app.log',
  
  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

// Validar configurações obrigatórias
const requiredConfigs = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

for (const configKey of requiredConfigs) {
  if (!config[configKey]) {
    console.error(`❌ Configuração obrigatória não encontrada: ${configKey}`);
    process.exit(1);
  }
}

module.exports = config;