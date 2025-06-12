const Joi = require('joi');

// Schema para validação de produto
const productSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Título deve ter pelo menos 3 caracteres',
    'string.max': 'Título deve ter no máximo 200 caracteres',
    'any.required': 'Título é obrigatório',
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Descrição deve ter pelo menos 10 caracteres',
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
    'any.required': 'Descrição é obrigatória',
  }),
  content_type: Joi.string().min(2).max(50).default('pdf').messages({
    'string.min': 'Tipo de conteúdo deve ter pelo menos 2 caracteres',
    'string.max': 'Tipo de conteúdo deve ter no máximo 50 caracteres',
  }),
  is_main: Joi.boolean().default(false).messages({
    'boolean.base': 'is_main deve ser true ou false',
  }),
  order: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Ordem deve ser um número',
    'number.integer': 'Ordem deve ser um número inteiro',
    'number.min': 'Ordem deve ser maior ou igual a 0',
  }),
});

// Schema para validação de atualização de produto
const productUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).messages({
    'string.min': 'Título deve ter pelo menos 3 caracteres',
    'string.max': 'Título deve ter no máximo 200 caracteres',
  }),
  description: Joi.string().min(10).max(1000).messages({
    'string.min': 'Descrição deve ter pelo menos 10 caracteres',
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
  }),
  content_type: Joi.string().min(2).max(50).messages({
    'string.min': 'Tipo de conteúdo deve ter pelo menos 2 caracteres',
    'string.max': 'Tipo de conteúdo deve ter no máximo 50 caracteres',
  }),
  is_main: Joi.boolean().messages({
    'boolean.base': 'is_main deve ser true ou false',
  }),
  order: Joi.number().integer().min(0).messages({
    'number.base': 'Ordem deve ser um número',
    'number.integer': 'Ordem deve ser um número inteiro',
    'number.min': 'Ordem deve ser maior ou igual a 0',
  }),
});

/**
 * Valida dados de produto
 * @param {Object} data - Dados a serem validados
 * @returns {Object} Resultado da validação
 */
const validateProduct = function(data) {
  const { error, value } = productSchema.validate(data, { abortEarly: false });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message),
      data: null,
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value,
  };
};

/**
 * Valida dados de atualização de produto
 * @param {Object} data - Dados a serem validados
 * @returns {Object} Resultado da validação
 */
const validateProductUpdate = function(data) {
  const { error, value } = productUpdateSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message),
      data: null,
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value,
  };
};

/**
 * Sanitiza dados de produto
 * @param {Object} data - Dados a serem sanitizados
 * @returns {Object} Dados sanitizados
 */
const sanitizeProductData = function(data) {
  return {
    title: data.title?.trim(),
    description: data.description?.trim(),
    content_type: data.content_type?.trim().toLowerCase(),
    is_main: data.is_main || false,
    order: parseInt(data.order) || 0,
  };
};

/**
 * Valida ID de produto
 * @param {string} id - ID a ser validado
 * @returns {boolean} True se o ID é válido
 */
const validateProductId = function(id) {
  return Joi.string().uuid().validate(id).error === undefined;
};

module.exports = {
  validateProduct,
  validateProductUpdate,
  sanitizeProductData,
  validateProductId,
  productSchema,
  productUpdateSchema,
};
