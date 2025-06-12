const config = require('../config/config');

/**
 * Middleware para capturar rotas não encontradas
 */
const notFound = (req, res, next) => {
  const error = new Error(`Página não encontrada - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Middleware global de tratamento de erros
 */
const errorHandler = (err, req, res, _next) => {
  const error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error('❌ Erro:', err);

  // Erro de validação do Joi
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error.message = message;
    error.status = 400;
  }

  // Erro do Supabase
  if (err.code) {
    switch (err.code) {
    case '23505': // Violação de unique constraint
      error.message = 'Este registro já existe';
      error.status = 400;
      break;
    case '23503': // Violação de foreign key
      error.message = 'Referência inválida';
      error.status = 400;
      break;
    default:
      error.message = 'Erro interno do servidor';
      error.status = 500;
    }
  }

  // Definir status padrão
  const status = error.status || 500;
  const message = error.message || 'Erro interno do servidor';

  // Resposta baseada no tipo de requisição
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    // Requisição AJAX/API
    res.status(status).json({
      success: false,
      error: message,
      ...(config.NODE_ENV === 'development' && { stack: err.stack }),
    });
  } else {
    // Requisição normal
    req.flash('error', message);

    if (status === 404) {
      res.status(404).render('errors/404', {
        title: 'Página não encontrada',
        message: 'A página que você está procurando não existe.',
        originalUrl: req.originalUrl,
        layout: 'layouts/error',
      });
    } else {
      res.status(status).render('errors/500', {
        title: 'Erro interno',
        message:
          config.NODE_ENV === 'development'
            ? message
            : 'Algo deu errado. Tente novamente.',
        layout: 'layouts/error',
        ...(config.NODE_ENV === 'development' && { stack: err.stack }),
      });
    }
  }
};

module.exports = {
  notFound,
  errorHandler,
};
