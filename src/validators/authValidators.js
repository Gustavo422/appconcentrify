const Joi = require('joi');

// Schema para validação de login
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória',
  }),
});

// Schema para validação de registro
const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 8 caracteres',
      'string.pattern.base':
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
      'any.required': 'Senha é obrigatória',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Senhas não coincidem',
    'any.required': 'Confirmação de senha é obrigatória',
  }),
});

/**
 * Valida dados de login
 * @param {Object} data - Dados a serem validados
 * @returns {Object} Resultado da validação
 */
const validateLogin = function(data) {
  const { error, value } = loginSchema.validate(data, { abortEarly: false });

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
 * Valida dados de registro
 * @param {Object} data - Dados a serem validados
 * @returns {Object} Resultado da validação
 */
const validateRegister = function(data) {
  const { error, value } = registerSchema.validate(data, { abortEarly: false });

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
 * Sanitiza dados de entrada
 * @param {Object} data - Dados a serem sanitizados
 * @returns {Object} Dados sanitizados
 */
const sanitizeAuthData = function(data) {
  return {
    email: data.email?.toLowerCase().trim(),
    password: data.password?.trim(),
  };
};

module.exports = {
  validateLogin,
  validateRegister,
  sanitizeAuthData,
  loginSchema,
  registerSchema,
};
