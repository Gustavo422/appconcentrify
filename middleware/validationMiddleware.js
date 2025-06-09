const Joi = require('joi');

/**
 * Middleware para validação de dados usando Joi
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(400).json({
          success: false,
          error: errorMessage,
          details: error.details
        });
      } else {
        req.flash('error', errorMessage);
        return res.redirect('back');
      }
    }

    next();
  };
};

// Schemas de validação comuns
const schemas = {
  // Validação de login
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'any.required': 'Senha é obrigatória'
      })
  }),

  // Validação de registro
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Senha deve ter pelo menos 8 caracteres',
        'string.pattern.base': 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
        'any.required': 'Senha é obrigatória'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Confirmação de senha deve ser igual à senha',
        'any.required': 'Confirmação de senha é obrigatória'
      })
  }),

  // Validação de usuário
  user: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório'
      }),
    is_admin: Joi.boolean().default(false)
  }),

  // Validação de produto
  product: Joi.object({
    title: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Título deve ter pelo menos 3 caracteres',
        'string.max': 'Título deve ter no máximo 200 caracteres',
        'any.required': 'Título é obrigatório'
      }),
    description: Joi.string()
      .max(1000)
      .allow('')
      .messages({
        'string.max': 'Descrição deve ter no máximo 1000 caracteres'
      }),
    content_type: Joi.string()
      .valid('pdf', 'macetes', 'simulados', 'questoes_semanais')
      .required()
      .messages({
        'any.only': 'Tipo de conteúdo deve ser: pdf, macetes, simulados ou questoes_semanais',
        'any.required': 'Tipo de conteúdo é obrigatório'
      }),
    is_main: Joi.boolean().default(false),
    order: Joi.number().integer().min(0).default(0)
  })
};

module.exports = {
  validate,
  schemas
};