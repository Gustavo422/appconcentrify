# Arquitetura do Concentrify WebApp

## 🏗️ Visão Geral

O Concentrify WebApp foi reestruturado seguindo os **princípios SOLID** e padrões modernos de desenvolvimento Node.js. Esta documentação detalha a nova arquitetura e as decisões tomadas.

## 📁 Estrutura de Pastas

```
concentrify-webapp/
├── src/                          # Código fonte principal
│   ├── controllers/              # Controladores (Single Responsibility)
│   │   ├── AuthController.js     # Autenticação
│   │   └── ProductController.js  # Produtos
│   ├── services/                 # Lógica de negócio
│   │   ├── AuthService.js        # Serviços de autenticação
│   │   └── ProductService.js     # Serviços de produtos
│   ├── models/                   # Modelos de dados
│   ├── validators/               # Validações específicas
│   │   ├── authValidators.js     # Validação de autenticação
│   │   └── productValidators.js  # Validação de produtos
│   ├── utils/                    # Utilitários e helpers
│   │   ├── responseHelper.js     # Respostas padronizadas
│   │   └── paginationHelper.js   # Paginação
│   └── constants/                # Constantes centralizadas
│       └── index.js              # Todas as constantes
├── routes/                       # Definição de rotas
├── middleware/                   # Middlewares customizados
├── config/                       # Configurações
│   ├── app.js                    # Configurações da aplicação
│   ├── config.js                 # Configurações gerais
│   └── database.js               # Configuração do banco
├── views/                        # Templates EJS
├── public/                       # Arquivos estáticos
└── uploads/                      # Uploads de arquivos
```

## 🎯 Princípios SOLID Aplicados

### 1. **Single Responsibility Principle (SRP)**

Cada classe e módulo tem uma única responsabilidade:

- **Controllers**: Apenas gerenciam requisições HTTP e respostas
- **Services**: Contêm apenas a lógica de negócio
- **Validators**: Validam apenas dados de entrada
- **Utils**: Fornecem apenas funcionalidades utilitárias

**Exemplo:**

```javascript
// ✅ Bom - Single Responsibility
class AuthController {
  constructor() {
    this.authService = new AuthService(); // Injeção de dependência
  }

  async login(req, res) {
    // Apenas gerencia a requisição HTTP
  }
}

class AuthService {
  async login(email, password) {
    // Apenas contém a lógica de negócio
  }
}
```

### 2. **Open/Closed Principle (OCP)**

A estrutura é aberta para extensão, fechada para modificação:

- **Middlewares extensíveis**: Novos middlewares podem ser adicionados sem modificar os existentes
- **Configurações centralizadas**: Novas configurações podem ser adicionadas sem alterar o código
- **Validators modulares**: Novos validators podem ser criados independentemente

**Exemplo:**

```javascript
// ✅ Bom - Open/Closed
const middlewares = {
  validate: schema => (req, res, next) => {
    /* ... */
  },
  validateQuery: schema => (req, res, next) => {
    /* ... */
  },
  validateParams: schema => (req, res, next) => {
    /* ... */
  },
};
```

### 3. **Liskov Substitution Principle (LSP)**

Interfaces consistentes entre diferentes implementações:

- **Padrão de resposta**: Todos os controllers retornam respostas no mesmo formato
- **Padrão de serviço**: Todos os services seguem a mesma interface
- **Padrão de validação**: Todos os validators retornam o mesmo formato

**Exemplo:**

```javascript
// ✅ Bom - Liskov Substitution
class BaseService {
  async create(data) {
    // Interface padrão
  }

  async update(id, data) {
    // Interface padrão
  }
}

class ProductService extends BaseService {
  // Implementa a mesma interface
}
```

### 4. **Interface Segregation Principle (ISP)**

Interfaces específicas para cada necessidade:

- **Validators específicos**: Cada entidade tem seu próprio validator
- **Utils especializados**: Cada utilitário tem uma função específica
- **Constants organizadas**: Constantes agrupadas por domínio

**Exemplo:**

```javascript
// ✅ Bom - Interface Segregation
// authValidators.js - Apenas validações de autenticação
function validateLogin(data) {
  /* ... */
}
function validateRegister(data) {
  /* ... */
}

// productValidators.js - Apenas validações de produtos
function validateProduct(data) {
  /* ... */
}
function validateProductUpdate(data) {
  /* ... */
}
```

### 5. **Dependency Inversion Principle (DIP)**

Dependências são injetadas, não criadas internamente:

- **Injeção de dependência**: Services são injetados nos controllers
- **Configurações centralizadas**: Dependências são configuradas externamente
- **Testabilidade**: Fácil mock de dependências para testes

**Exemplo:**

```javascript
// ✅ Bom - Dependency Inversion
class AuthController {
  constructor(authService) {
    this.authService = authService; // Injeção de dependência
  }
}

// Uso
const authService = new AuthService();
const authController = new AuthController(authService);
```

## 🔄 Padrões de Design Aplicados

### 1. **MVC (Model-View-Controller)**

- **Model**: Representado pelos services e models
- **View**: Templates EJS
- **Controller**: Controllers que gerenciam requisições

### 2. **Repository Pattern**

Services atuam como repositories, abstraindo o acesso aos dados:

```javascript
class ProductService {
  async getAllProducts() {
    // Abstrai o acesso ao Supabase
  }
}
```

### 3. **Factory Pattern**

Utilitários para criar objetos padronizados:

```javascript
// responseHelper.js
function sendSuccess(res, statusCode, message, data) {
  // Factory para respostas de sucesso
}
```

### 4. **Middleware Pattern**

Chain de middlewares para processar requisições:

```javascript
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(rateLimit());
```

## 🛡️ Segurança

### 1. **Validação em Camadas**

- **Frontend**: Validação básica com HTML5
- **Middleware**: Validação com Joi
- **Service**: Validação de negócio
- **Database**: Constraints do Supabase

### 2. **Autenticação e Autorização**

- **Sessions**: Sessões seguras com cookies
- **Rate Limiting**: Limitação de tentativas de login
- **Role-based Access**: Controle de acesso por roles
- **Password Hashing**: Bcrypt com 12 rounds

### 3. **Headers de Segurança**

- **Helmet**: Headers de segurança automáticos
- **CORS**: Controle de origem cruzada
- **CSP**: Content Security Policy

## 📊 Gerenciamento de Estado

### 1. **Sessões**

- **Express Session**: Gerenciamento de sessões
- **Redis Ready**: Preparado para Redis em produção
- **Secure Cookies**: Cookies seguros em produção

### 2. **Flash Messages**

- **Sucesso**: Mensagens de sucesso temporárias
- **Erro**: Mensagens de erro temporárias
- **Info**: Mensagens informativas

## 🔧 Configuração

### 1. **Configurações Centralizadas**

```javascript
// config/app.js
const appConfig = {
  port: CONFIG.PORT,
  security: {
    /* ... */
  },
  upload: {
    /* ... */
  },
  viewEngine: {
    /* ... */
  },
};
```

### 2. **Variáveis de Ambiente**

```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
SESSION_SECRET=your-secret
```

## 🧪 Testabilidade

### 1. **Estrutura Testável**

- **Dependency Injection**: Fácil mock de dependências
- **Separation of Concerns**: Cada camada pode ser testada independentemente
- **Pure Functions**: Utilitários são funções puras

### 2. **Cobertura de Testes**

- **Unit Tests**: Testes de unidades individuais
- **Integration Tests**: Testes de integração
- **E2E Tests**: Testes end-to-end

## 📈 Performance

### 1. **Otimizações**

- **Compression**: Gzip para respostas
- **Caching**: Headers de cache apropriados
- **Database**: Queries otimizadas
- **Static Files**: Servir arquivos estáticos eficientemente

### 2. **Monitoramento**

- **Morgan**: Logging de requisições
- **Error Tracking**: Rastreamento de erros
- **Performance Metrics**: Métricas de performance

## 🔄 Fluxo de Dados

```
Request → Middleware → Route → Controller → Service → Database
   ↑                                                           ↓
Response ← View ← Controller ← Service ← Database ← Response
```

## 📝 Convenções de Código

### 1. **Nomenclatura**

- **Controllers**: PascalCase + "Controller" (ex: `AuthController`)
- **Services**: PascalCase + "Service" (ex: `AuthService`)
- **Validators**: camelCase + "Validators" (ex: `authValidators`)
- **Utils**: camelCase + "Helper" (ex: `responseHelper`)

### 2. **Estrutura de Arquivos**

- **Um arquivo por classe**: Cada classe em seu próprio arquivo
- **Export padrão**: Classes exportadas como default
- **Imports organizados**: Imports organizados por tipo

### 3. **Documentação**

- **JSDoc**: Documentação de funções e classes
- **README**: Documentação do projeto
- **ARCHITECTURE.md**: Documentação da arquitetura

## 🚀 Deploy

### 1. **Ambiente de Desenvolvimento**

```bash
npm run dev
```

### 2. **Ambiente de Produção**

```bash
npm run build:css:prod
npm start
```

### 3. **Variáveis de Produção**

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=production-url
SUPABASE_ANON_KEY=production-key
SESSION_SECRET=production-secret
```

## 🔮 Próximos Passos

### 1. **Melhorias Planejadas**

- [ ] Implementar cache com Redis
- [ ] Adicionar testes automatizados
- [ ] Implementar logging estruturado
- [ ] Adicionar monitoramento de performance

### 2. **Escalabilidade**

- [ ] Preparar para load balancing
- [ ] Implementar microserviços
- [ ] Adicionar CDN para assets
- [ ] Otimizar queries de banco

---

Esta arquitetura garante **manutenibilidade**, **escalabilidade** e **testabilidade** do código, seguindo as melhores práticas de desenvolvimento Node.js e os princípios SOLID.
