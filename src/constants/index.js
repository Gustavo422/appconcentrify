// Constantes de autenticação
const AUTH = {
  SALT_ROUNDS: 12,
  SESSION_NAME: 'concentrify.sid',
  LOGIN_ATTEMPTS_LIMIT: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
};

// Constantes de paginação
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Constantes de upload
const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  UPLOAD_PATH: 'uploads/',
};

// Constantes de status
const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Constantes de roles/permissões
const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Constantes de mensagens
const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    LOGIN_ERROR: 'Email ou senha incorretos',
    REGISTER_SUCCESS: 'Usuário criado com sucesso!',
    REGISTER_ERROR: 'Erro ao criar usuário',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso',
    UNAUTHORIZED: 'Acesso não autorizado',
    FORBIDDEN: 'Acesso restrito a administradores',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Campo obrigatório',
    INVALID_EMAIL: 'Email deve ter um formato válido',
    PASSWORD_TOO_SHORT: 'Senha deve ter pelo menos 8 caracteres',
    PASSWORD_PATTERN:
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
    PASSWORDS_DONT_MATCH: 'Senhas não coincidem',
  },
  ERROR: {
    INTERNAL_SERVER: 'Erro interno. Tente novamente.',
    NOT_FOUND: 'Recurso não encontrado',
    VALIDATION_ERROR: 'Dados inválidos',
    RATE_LIMIT: 'Muitas tentativas. Tente novamente em alguns minutos.',
  },
};

// Constantes de configuração
const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost',
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: 100,
};

module.exports = {
  AUTH,
  PAGINATION,
  UPLOAD,
  STATUS,
  ROLES,
  MESSAGES,
  CONFIG,
};
