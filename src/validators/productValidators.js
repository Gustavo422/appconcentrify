const Joi = require('joi');

// Schema para validação de produto
const productSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Título deve ter pelo menos 3 caracteres',
    'string.max': 'Título deve ter no máximo 200 caracteres',
    'any.required': 'Título é obrigatório',
  }),
  description: Joi.string().max(1000).allow('').messages({
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
  }),
  cover_image: Joi.string().uri().allow('').messages({
    'string.uri': 'URL da imagem deve ser válida',
  }),
  content_type: Joi.string()
    .valid('pdf', 'simulados', 'questoes_semanais', 'macetes')
    .required()
    .messages({
      'any.only': 'Tipo de conteúdo deve ser: pdf, simulados, questoes_semanais ou macetes',
      'any.required': 'Tipo de conteúdo é obrigatório',
    }),
  file_url: Joi.string().uri().allow('').messages({
    'string.uri': 'URL do arquivo deve ser válida',
  }),
  is_main: Joi.boolean().default(false).messages({
    'boolean.base': 'is_main deve ser true ou false',
  }),
  order: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Ordem deve ser um número',
    'number.integer': 'Ordem deve ser um número inteiro',
    'number.min': 'Ordem deve ser maior ou igual a 0',
  }),
  json_content: Joi.string().allow('').messages({
    'string.base': 'Conteúdo JSON deve ser uma string',
  }),
});

// Schema para validação de atualização de produto
const productUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).messages({
    'string.min': 'Título deve ter pelo menos 3 caracteres',
    'string.max': 'Título deve ter no máximo 200 caracteres',
  }),
  description: Joi.string().max(1000).allow('').messages({
    'string.max': 'Descrição deve ter no máximo 1000 caracteres',
  }),
  cover_image: Joi.string().uri().allow('').messages({
    'string.uri': 'URL da imagem deve ser válida',
  }),
  content_type: Joi.string()
    .valid('pdf', 'simulados', 'questoes_semanais', 'macetes')
    .messages({
      'any.only': 'Tipo de conteúdo deve ser: pdf, simulados, questoes_semanais ou macetes',
    }),
  file_url: Joi.string().uri().allow('').messages({
    'string.uri': 'URL do arquivo deve ser válida',
  }),
  is_main: Joi.boolean().messages({
    'boolean.base': 'is_main deve ser true ou false',
  }),
  order: Joi.number().integer().min(0).messages({
    'number.base': 'Ordem deve ser um número',
    'number.integer': 'Ordem deve ser um número inteiro',
    'number.min': 'Ordem deve ser maior ou igual a 0',
  }),
  json_content: Joi.string().allow('').messages({
    'string.base': 'Conteúdo JSON deve ser uma string',
  }),
});

// Schema para validação de simulados/questões semanais
const simuladoSchema = Joi.object({
  titulo: Joi.string().required().messages({
    'any.required': 'Título é obrigatório',
    'string.empty': 'Título não pode estar vazio',
  }),
  descricao: Joi.string().allow(''),
  semana_referencia: Joi.string().when('$isQuestoesSemanas', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  areas_conhecimento: Joi.array().items(
    Joi.object({
      materia: Joi.string().required().messages({
        'any.required': 'Nome da matéria é obrigatório',
        'string.empty': 'Nome da matéria não pode estar vazio',
      }),
      questoes: Joi.array().items(
        Joi.object({
          enunciado: Joi.string().required().messages({
            'any.required': 'Enunciado da questão é obrigatório',
            'string.empty': 'Enunciado não pode estar vazio',
          }),
          alternativas: Joi.object({
            A: Joi.string().required(),
            B: Joi.string().required(),
            C: Joi.string().required(),
            D: Joi.string().required(),
            E: Joi.string().required(),
          }).required().messages({
            'any.required': 'Todas as alternativas (A, B, C, D, E) são obrigatórias',
          }),
          correta: Joi.string().valid('A', 'B', 'C', 'D', 'E').required().messages({
            'any.only': 'Resposta correta deve ser A, B, C, D ou E',
            'any.required': 'Resposta correta é obrigatória',
          }),
          nivel_dificuldade: Joi.string().valid('básico', 'médio', 'avançado').optional(),
        })
      ).min(1).required().messages({
        'array.min': 'Deve haver pelo menos uma questão por matéria',
        'any.required': 'Lista de questões é obrigatória',
      }),
    })
  ).min(1).required().messages({
    'array.min': 'Deve haver pelo menos uma área de conhecimento',
    'any.required': 'Áreas de conhecimento são obrigatórias',
  }),
});

// Schema para validação de macetes
const macetesSchema = Joi.array().items(
  Joi.object({
    classe: Joi.string().required().messages({
      'any.required': 'Classe/categoria é obrigatória',
      'string.empty': 'Classe não pode estar vazia',
    }),
    nivel: Joi.string().valid('Básico', 'Intermediário', 'Especialista').required().messages({
      'any.only': 'Nível deve ser: Básico, Intermediário ou Especialista',
      'any.required': 'Nível é obrigatório',
    }),
    macete: Joi.string().required().messages({
      'any.required': 'Texto do macete é obrigatório',
      'string.empty': 'Macete não pode estar vazio',
    }),
    abreviacao: Joi.string().allow(''),
    explicacao: Joi.string().required().messages({
      'any.required': 'Explicação é obrigatória',
      'string.empty': 'Explicação não pode estar vazia',
    }),
  })
).min(1).messages({
  'array.min': 'Deve haver pelo menos um macete',
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
 * Valida estrutura JSON de simulados/questões semanais
 * @param {Object} data - Dados JSON a serem validados
 * @param {boolean} isQuestoesSemanas - Se é questões semanais
 * @returns {Object} Resultado da validação
 */
const validateSimuladoJSON = function(data, isQuestoesSemanas = false) {
  const { error, value } = simuladoSchema.validate(data, {
    abortEarly: false,
    context: { isQuestoesSemanas }
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
 * Valida estrutura JSON de macetes
 * @param {Array} data - Array de macetes a serem validados
 * @returns {Object} Resultado da validação
 */
const validateMacetesJSON = function(data) {
  const { error, value } = macetesSchema.validate(data, { abortEarly: false });

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
    cover_image: data.cover_image?.trim(),
    content_type: data.content_type?.trim().toLowerCase(),
    file_url: data.file_url?.trim(),
    is_main: data.is_main === 'true' || data.is_main === true,
    order: parseInt(data.order) || 0,
    json_content: data.json_content?.trim(),
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

/**
 * Valida tipo de arquivo
 * @param {string} filename - Nome do arquivo
 * @param {string} contentType - Tipo de conteúdo esperado
 * @returns {Object} Resultado da validação
 */
const validateFileType = function(filename, contentType) {
  const allowedExtensions = {
    pdf: ['.pdf'],
    simulados: ['.json'],
    questoes_semanais: ['.json'],
    macetes: ['.json'],
  };

  const extensions = allowedExtensions[contentType] || [];
  const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

  if (!extensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Arquivo deve ter extensão: ${extensions.join(', ')}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Valida tamanho do arquivo
 * @param {number} size - Tamanho do arquivo em bytes
 * @param {number} maxSize - Tamanho máximo permitido em bytes
 * @returns {Object} Resultado da validação
 */
const validateFileSize = function(size, maxSize = 10 * 1024 * 1024) {
  if (size > maxSize) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

module.exports = {
  validateProduct,
  validateProductUpdate,
  validateSimuladoJSON,
  validateMacetesJSON,
  sanitizeProductData,
  validateProductId,
  validateFileType,
  validateFileSize,
  productSchema,
  productUpdateSchema,
  simuladoSchema,
  macetesSchema,
};