# Concentrify WebApp

Uma aplicação web moderna para gerenciamento de conteúdo educacional, simulados e macetes para concursos, construída com Node.js, Express, EJS e Tailwind CSS.

## 🏗️ Arquitetura

O projeto segue os **princípios SOLID** e padrões de desenvolvimento modernos:

### 📁 Estrutura de Pastas

```
concentrify-webapp/
├── src/                          # Código fonte principal
│   ├── controllers/              # Controladores (Single Responsibility)
│   ├── services/                 # Lógica de negócio
│   ├── models/                   # Modelos de dados
│   ├── validators/               # Validações específicas
│   ├── utils/                    # Utilitários e helpers
│   └── constants/                # Constantes centralizadas
├── routes/                       # Definição de rotas
├── middleware/                   # Middlewares customizados
├── config/                       # Configurações
├── views/                        # Templates EJS
├── public/                       # Arquivos estáticos
└── uploads/                      # Uploads de arquivos
```

### 🎯 Princípios SOLID Aplicados

#### 1. **Single Responsibility Principle (SRP)**

- Cada controller tem uma única responsabilidade
- Services separados para lógica de negócio
- Validators específicos para cada entidade

#### 2. **Open/Closed Principle (OCP)**

- Middlewares extensíveis
- Configurações centralizadas
- Estrutura modular

#### 3. **Liskov Substitution Principle (LSP)**

- Interfaces consistentes entre services
- Padrões de resposta padronizados

#### 4. **Interface Segregation Principle (ISP)**

- Validators específicos por domínio
- Utilitários especializados

#### 5. **Dependency Inversion Principle (DIP)**

- Injeção de dependências nos controllers
- Configurações centralizadas

## 🚀 Tecnologias

- **Backend**: Node.js, Express.js
- **View Engine**: EJS com layouts
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Session-based com bcrypt
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Instalação

1. **Clone o repositório**

```bash
git clone <repository-url>
cd concentrify-webapp
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

4. **Configure o Supabase**

- Crie um projeto no Supabase
- Configure as variáveis de ambiente com suas credenciais

5. **Execute as migrações**

```bash
npm run migrate
```

6. **Inicie o servidor**

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔧 Scripts Disponíveis

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "build": "npm run build:css",
  "build:css": "tailwindcss -i ./public/css/input.css -o ./public/css/output.css --watch",
  "setup": "node scripts/setup.js",
  "migrate": "node scripts/migrate.js",
  "seed": "node scripts/seed.js"
}
```

## 🏛️ Estrutura de Código

### Controllers

```javascript
// src/controllers/AuthController.js
class AuthController {
  constructor() {
    this.authService = new AuthService(); // Dependency Injection
  }

  async login(req, res) {
    // Lógica de controller
  }
}
```

### Services

```javascript
// src/services/AuthService.js
class AuthService {
  async login(email, password) {
    // Lógica de negócio
  }
}
```

### Validators

```javascript
// src/validators/authValidators.js
function validateLogin(data) {
  // Validação específica
}
```

### Utilitários

```javascript
// src/utils/responseHelper.js
function sendSuccess(res, statusCode, message, data) {
  // Resposta padronizada
}
```

## 🔐 Autenticação

O sistema utiliza autenticação baseada em sessões com:

- **Login/Logout** para usuários
- **Registro** apenas para administradores
- **Rate limiting** para prevenir ataques
- **Validação** de dados de entrada
- **Hash** de senhas com bcrypt

## 🛡️ Segurança

- **Helmet** para headers de segurança
- **CORS** configurado
- **Rate Limiting** para prevenir abuso
- **Validação** de entrada com Joi
- **Sanitização** de dados
- **Sessões seguras**

## 📊 Banco de Dados

### Tabelas Principais

- `users` - Usuários do sistema
- `products` - Produtos/cursos
- `simulados` - Simulados disponíveis
- `questoes_semanais` - Questões semanais
- `macetes` - Macetes e dicas

## 🎨 Frontend

- **Tailwind CSS** para estilização
- **EJS** como template engine
- **Layouts responsivos**
- **Componentes reutilizáveis**

## 🔄 Padrões de Desenvolvimento

### 1. **DRY (Don't Repeat Yourself)**

- Utilitários centralizados
- Helpers reutilizáveis
- Constantes compartilhadas

### 2. **Clean Code**

- Nomes descritivos
- Funções pequenas e focadas
- Comentários JSDoc

### 3. **Error Handling**

- Middleware de erro centralizado
- Respostas padronizadas
- Logging estruturado

### 4. **Validation**

- Validação em camadas
- Schemas específicos
- Mensagens de erro claras

## 📝 API Endpoints

### Autenticação

- `GET /auth/login` - Página de login
- `POST /auth/login` - Processar login
- `POST /auth/logout` - Logout

### Produtos

- `GET /products` - Listar produtos
- `GET /products/:id` - Ver produto
- `POST /products` - Criar produto (admin)
- `PUT /products/:id` - Atualizar produto (admin)
- `DELETE /products/:id` - Remover produto (admin)

### Admin

- `GET /admin/dashboard` - Dashboard administrativo
- `GET /admin/users` - Gerenciar usuários

## 🧪 Testes

```bash
# Executar testes
npm test

# Cobertura de código
npm run test:coverage
```

## 📈 Monitoramento

- **Morgan** para logging de requisições
- **Error tracking** centralizado
- **Performance monitoring**

## 🚀 Deploy

### Variáveis de Ambiente Necessárias

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
SESSION_SECRET=your-session-secret
```

### Comandos de Deploy

```bash
# Build da aplicação
npm run build

# Iniciar em produção
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Concentrify Team** - Desenvolvimento e manutenção

## 📞 Suporte

Para suporte, envie um email para suporte@concentrify.com ou abra uma issue no GitHub.

---

**Concentrify** - Transformando a preparação para concursos! 🎯
