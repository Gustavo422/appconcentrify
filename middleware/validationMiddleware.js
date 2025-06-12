const Joi = require('joi');

/**
 * Middleware de validação genérico
 * Segue o princípio Open/Closed - extensível para novos schemas
 */
const validate = function(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      req.flash('error', errors[0]);
      return res.redirect('back');
    }

    // Sanitizar dados validados
    req.body = value;
    next();
  };
};

/**
 * Middleware de validação para parâmetros de query
 */
const validateQuery = function(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      req.flash('error', errors[0]);
      return res.redirect('back');
    }

    req.query = value;
    next();
  };
};

/**
 * Middleware de validação para parâmetros de URL
 */
const validateParams = function(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      req.flash('error', errors[0]);
      return res.redirect('back');
    }

    req.params = value;
    next();
  };
};

/**
 * Middleware de validação customizada com callback
 */
const validateWithCallback = function(validator, options = {}) {
  return (req, res, next) => {
    const result = validator(req.body);

    if (!result.isValid) {
      if (options.redirect) {
        req.flash('error', result.errors[0]);
        return res.redirect(options.redirect);
      }

      if (options.json) {
        return res.status(422).json({
          success: false,
          message: 'Dados inválidos',
          errors: result.errors,
        });
      }

      req.flash('error', result.errors[0]);
      return res.redirect('back');
    }

    req.body = result.data;
    next();
  };
};

/**
 * Middleware para validar IDs UUID
 */
const validateUuid = function(field = 'id') {
  const schema = Joi.object({
    [field]: Joi.string().uuid().required(),
  });

  return validateParams(schema);
};

/**
 * Middleware para validar paginação
 */
const validatePagination = function() {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });

  return validateQuery(schema);
};

// Schemas de validação comuns
const schemas = {
  // Validação de login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória',
    }),
  }),

  // Validação de registro
  register: Joi.object({
    email: Joi.string().email().required().messages({
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
          'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
        'any.required': 'Senha é obrigatória',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Confirmação de senha deve ser igual à senha',
        'any.required': 'Confirmação de senha é obrigatória',
      }),
  }),

  // Validação de usuário
  user: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório',
    }),
    password: Joi.string().min(6).allow('').optional().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
    }),
    is_admin: Joi.boolean().default(false),
  }),

  // Validação de produto
  product: Joi.object({
    title: Joi.string().min(3).max(200).required().messages({
      'string.min': 'Título deve ter pelo menos 3 caracteres',
      'string.max': 'Título deve ter no máximo 200 caracteres',
      'any.required': 'Título é obrigatório',
    }),
    description: Joi.string().max(1000).allow('').messages({
      'string.max': 'Descrição deve ter no máximo 1000 caracteres',
    }),
    content_type: Joi.string()
      .valid('pdf', 'macetes', 'simulados', 'questoes_semanais')
      .required()
      .messages({
        'any.only':
          'Tipo de conteúdo deve ser: pdf, macetes, simulados ou questoes_semanais',
        'any.required': 'Tipo de conteúdo é obrigatório',
      }),
    is_main: Joi.boolean().default(false),
    order: Joi.number().integer().min(0).default(0),
  }),
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  validateWithCallback,
  validateUuid,
  validatePagination,
  schemas,
};
