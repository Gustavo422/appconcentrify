module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    // Regras de estilo
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    
    // Regras de variáveis
    'no-var': 'error',
    'prefer-const': 'error',
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-undef': 'error',
    
    // Regras de funções
    'func-style': ['error', 'expression'],
    'arrow-spacing': 'error',
    'no-confusing-arrow': 'error',
    'prefer-arrow-callback': 'error',
    
    // Regras de objetos
    'object-curly-spacing': ['error', 'always'],
    'object-shorthand': 'error',
    'prefer-object-spread': 'error',
    
    // Regras de arrays
    'array-bracket-spacing': ['error', 'never'],
    'array-callback-return': 'error',
    
    // Regras de strings
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    
    // Regras de controle de fluxo
    'no-else-return': 'error',
    'no-nested-ternary': 'error',
    'prefer-early-return': 'error',
    
    // Regras de comparação
    'eqeqeq': ['error', 'always'],
    'no-eq-null': 'error',
    
    // Regras de segurança
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Regras de performance
    'no-loop-func': 'error',
    'no-unused-expressions': 'error',
    
    // Regras de documentação
    'require-jsdoc': ['warn', {
      'require': {
        'FunctionDeclaration': true,
        'MethodDefinition': true,
        'ClassDeclaration': true,
      },
      'contexts': ['ExportNamedDeclaration'],
    }],
    'valid-jsdoc': 'warn',
    
    // Regras de complexidade
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-lines-per-function': ['warn', 50],
    'max-params': ['warn', 4],
    
    // Regras de organização
    'sort-imports': ['warn', {
      'ignoreCase': false,
      'ignoreDeclarationSort': true,
      'ignoreMemberSort': false,
      'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
    }],
    
    // Regras específicas do projeto
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
  overrides: [
    {
      // Configurações específicas para arquivos de teste
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-unused-expressions': 'off',
      },
    },
    {
      // Configurações específicas para arquivos de configuração
      files: ['*.config.js', '*.config.mjs'],
      rules: {
        'require-jsdoc': 'off',
        'valid-jsdoc': 'off',
      },
    },
  ],
  globals: {
    // Variáveis globais do Express
    'process': 'readonly',
    'Buffer': 'readonly',
    '__dirname': 'readonly',
    '__filename': 'readonly',
    'module': 'readonly',
    'require': 'readonly',
    'exports': 'readonly',
    'global': 'readonly',
    'console': 'readonly',
    'setTimeout': 'readonly',
    'clearTimeout': 'readonly',
    'setInterval': 'readonly',
    'clearInterval': 'readonly',
    'setImmediate': 'readonly',
    'clearImmediate': 'readonly',
  },
}; 