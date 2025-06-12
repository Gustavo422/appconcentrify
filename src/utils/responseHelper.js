/**
 * Utilitário para padronizar respostas da API
 * Segue o princípio DRY (Don't Repeat Yourself)
 */

/**
 * Cria uma resposta de sucesso padronizada
 * @param {Object} res - Objeto response do Express
 * @param {number} statusCode - Código de status HTTP
 * @param {string} message - Mensagem de sucesso
 * @param {*} data - Dados a serem retornados
 * @param {Object} options - Opções adicionais
 */
const sendSuccess = function(
  res,
  statusCode = 200,
  message = 'Operação realizada com sucesso',
  data = null,
  options = {},
) {
  const response = {
    success: true,
    message,
    ...(data && { data }),
    ...(options.meta && { meta: options.meta }),
    ...(options.pagination && { pagination: options.pagination }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Cria uma resposta de erro padronizada
 * @param {Object} res - Objeto response do Express
 * @param {number} statusCode - Código de status HTTP
 * @param {string} message - Mensagem de erro
 * @param {*} errors - Detalhes dos erros
 * @param {Object} options - Opções adicionais
 */
const sendError = function(
  res,
  statusCode = 400,
  message = 'Erro na operação',
  errors = null,
  options = {},
) {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(options.code && { code: options.code }),
    ...(options.timestamp && { timestamp: new Date().toISOString() }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Cria uma resposta de validação padronizada
 * @param {Object} res - Objeto response do Express
 * @param {Array} errors - Lista de erros de validação
 */
const sendValidationError = function(res, errors) {
  return sendError(res, 422, 'Dados inválidos', errors, {
    code: 'VALIDATION_ERROR',
  });
};

/**
 * Cria uma resposta de não encontrado padronizada
 * @param {Object} res - Objeto response do Express
 * @param {string} resource - Nome do recurso não encontrado
 */
const sendNotFound = function(res, resource = 'Recurso') {
  return sendError(res, 404, `${resource} não encontrado`, null, {
    code: 'NOT_FOUND',
  });
};

/**
 * Cria uma resposta de não autorizado padronizada
 * @param {Object} res - Objeto response do Express
 * @param {string} message - Mensagem personalizada
 */
const sendUnauthorized = function(res, message = 'Acesso não autorizado') {
  return sendError(res, 401, message, null, { code: 'UNAUTHORIZED' });
};

/**
 * Cria uma resposta de acesso negado padronizada
 * @param {Object} res - Objeto response do Express
 * @param {string} message - Mensagem personalizada
 */
const sendForbidden = function(res, message = 'Acesso negado') {
  return sendError(res, 403, message, null, { code: 'FORBIDDEN' });
};

/**
 * Cria uma resposta de erro interno padronizada
 * @param {Object} res - Objeto response do Express
 * @param {Error} error - Objeto de erro
 */
const sendInternalError = function(res, error = null) {
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : error?.message || 'Erro interno do servidor';

  return sendError(res, 500, message, null, {
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Cria uma resposta de paginação padronizada
 * @param {Object} res - Objeto response do Express
 * @param {Array} data - Dados da página
 * @param {Object} pagination - Informações de paginação
 * @param {string} message - Mensagem de sucesso
 */
const sendPaginatedResponse = function(
  res,
  data,
  pagination,
  message = 'Dados recuperados com sucesso',
) {
  return sendSuccess(res, 200, message, data, { pagination });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendInternalError,
  sendPaginatedResponse,
};
