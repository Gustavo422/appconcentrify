const { PAGINATION } = require('../constants');

/**
 * Utilitário para paginação
 * Segue o princípio DRY (Don't Repeat Yourself)
 */

/**
 * Calcula os parâmetros de paginação
 * @param {Object} query - Query parameters da requisição
 * @returns {Object} Parâmetros de paginação
 */
const getPaginationParams = function(query) {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT),
  );
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

/**
 * Cria objeto de metadados de paginação
 * @param {number} page - Página atual
 * @param {number} limit - Limite por página
 * @param {number} total - Total de registros
 * @param {number} totalPages - Total de páginas
 * @returns {Object} Metadados de paginação
 */
const createPaginationMeta = function(page, limit, total, totalPages) {
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

/**
 * Aplica paginação a uma query do Supabase
 * @param {Object} query - Query do Supabase
 * @param {Object} paginationParams - Parâmetros de paginação
 * @returns {Object} Query com paginação aplicada
 */
const applyPagination = function(query, paginationParams) {
  return query.range(
    paginationParams.offset,
    paginationParams.offset + paginationParams.limit - 1,
  );
};

/**
 * Processa resultado paginado do Supabase
 * @param {Object} result - Resultado da query do Supabase
 * @param {Object} paginationParams - Parâmetros de paginação
 * @returns {Object} Dados paginados formatados
 */
const processPaginatedResult = function(result, paginationParams) {
  const { data, error, count } = result;

  if (error) {
    throw error;
  }

  const total = count || data.length;
  const totalPages = Math.ceil(total / paginationParams.limit);

  return {
    data,
    pagination: createPaginationMeta(
      paginationParams.page,
      paginationParams.limit,
      total,
      totalPages,
    ),
  };
};

/**
 * Valida parâmetros de paginação
 * @param {Object} query - Query parameters
 * @returns {Object} Resultado da validação
 */
const validatePaginationParams = function(query) {
  const errors = [];

  if (query.page && (isNaN(query.page) || parseInt(query.page) < 1)) {
    errors.push('Página deve ser um número maior que 0');
  }

  if (query.limit && (isNaN(query.limit) || parseInt(query.limit) < 1)) {
    errors.push('Limite deve ser um número maior que 0');
  }

  if (query.limit && parseInt(query.limit) > PAGINATION.MAX_LIMIT) {
    errors.push(`Limite máximo é ${PAGINATION.MAX_LIMIT}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  getPaginationParams,
  createPaginationMeta,
  applyPagination,
  processPaginatedResult,
  validatePaginationParams,
};
