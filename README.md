# Concentrify WebApp - Node.js

> Aplicação web moderna para gerenciamento de conteúdo educacional, simulados e macetes para concursos públicos.

## 🚀 Tecnologias

- **Backend**: Node.js + Express.js
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT + Sessions
- **Frontend**: EJS + TailwindCSS
- **Segurança**: Helmet, Rate Limiting, CORS
- **Validação**: Joi
- **Upload**: Multer

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no [Supabase](https://supabase.com)
- Git

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/concentrify-webapp.git
cd concentrify-webapp
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Configurações do Servidor
NODE_ENV=development
PORT=3000
HOST=localhost

# Configurações de Segurança
JWT_SECRET=seu-jwt-secret-super-seguro-aqui
SESSION_SECRET=seu-session-secret-super-seguro-aqui

# Configurações do Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
```

### 4. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Copie a URL e as chaves do projeto
3. Execute as migrações:

```bash
npm run setup
```

### 5. Inicie a aplicação

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema
- **products**: Produtos educacionais
- **simulados**: Simulados e questões
- **macetes**: Macetes de memorização
- **questoes_semanais**: Questões semanais

### Migrações

As migrações são executadas automaticamente com o comando `npm run setup`. Elas criam:

- Todas as tabelas necessárias
- Índices para performance
- Políticas RLS (Row Level Security)
- Triggers para campos de timestamp
- Usuário administrador inicial

## 👤 Credenciais Padrão

Após a configuração inicial:

- **Email**: admin@concentrify.com
- **Senha**: admin123

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

## 🏗️ Estrutura do Projeto

```
concentrify-webapp/
├── config/                 # Configurações
│   ├── config.js          # Configurações gerais
│   └── database.js        # Configuração do Supabase
├── middleware/             # Middlewares
│   ├── authMiddleware.js  # Autenticação
│   ├── errorMiddleware.js # Tratamento de erros
│   ├── sessionMiddleware.js # Sessões
│   └── validationMiddleware.js # Validação
├── routes/                 # Rotas da aplicação
│   ├── auth.js            # Autenticação
│   ├── admin.js           # Administração
│   ├── products.js        # Produtos
│   ├── simulados.js       # Simulados
│   ├── macetes.js         # Macetes
│   └── questoesSemanais.js # Questões semanais
├── views/                  # Templates EJS
│   ├── layouts/           # Layouts base
│   ├── auth/              # Páginas de autenticação
│   ├── admin/             # Páginas administrativas
│   ├── products/          # Páginas de produtos
│   └── errors/            # Páginas de erro
├── public/                 # Arquivos estáticos
│   ├── css/               # Estilos CSS
│   ├── js/                # JavaScript
│   └── images/            # Imagens
├── scripts/               # Scripts utilitários
│   ├── setup.js           # Configuração inicial
│   ├── migrate.js         # Migrações
│   └── seed.js            # Dados iniciais
├── migrations/            # Migrações SQL
├── uploads/               # Arquivos enviados
└── server.js              # Servidor principal
```

## 🔐 Segurança

### Implementações de Segurança

- **Helmet**: Proteção de cabeçalhos HTTP
- **Rate Limiting**: Limitação de requisições
- **CORS**: Controle de origem cruzada
- **Sessions**: Sessões seguras com cookies
- **JWT**: Tokens para autenticação
- **Bcrypt**: Hash de senhas
- **Joi**: Validação de dados
- **RLS**: Row Level Security no Supabase

### Boas Práticas

- Senhas com hash bcrypt (12 rounds)
- Sessões com expiração automática
- Validação rigorosa de entrada
- Sanitização de dados
- Logs de segurança
- Políticas de acesso granulares

## 🎨 Interface

### Design System

- **Framework**: TailwindCSS
- **Componentes**: Sistema modular
- **Responsividade**: Mobile-first
- **Acessibilidade**: WCAG 2.1
- **Paleta**: Material Design inspirada

### Características

- Interface moderna e intuitiva
- Animações suaves
- Feedback visual claro
- Navegação consistente
- Otimizada para performance

## 📱 Funcionalidades

### Para Usuários

- ✅ Login seguro
- ✅ Visualização de produtos
- ✅ Acesso a simulados
- ✅ Consulta de macetes
- ✅ Questões semanais
- ✅ Histórico de atividades

### Para Administradores

- ✅ Dashboard completo
- ✅ Gerenciamento de usuários
- ✅ Controle de produtos
- ✅ Administração de simulados
- ✅ Gestão de macetes
- ✅ Configuração de questões semanais

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas

- **Heroku**: Suporte nativo ao Node.js
- **Railway**: Deploy simples
- **DigitalOcean**: App Platform
- **AWS**: Elastic Beanstalk

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📊 Monitoramento

### Logs

- Logs estruturados com Winston
- Níveis: error, warn, info, debug
- Rotação automática de arquivos
- Integração com serviços externos

### Métricas

- Performance de rotas
- Uso de memória
- Conexões de banco
- Taxa de erro

## 🔄 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia com nodemon
npm run build        # Build do CSS
npm run build:css    # Build do TailwindCSS

# Produção
npm start            # Inicia servidor
npm run setup        # Configuração inicial
npm run migrate      # Executar migrações
npm run seed         # Dados iniciais

# Utilitários
npm run lint         # Verificar código
npm run format       # Formatar código
npm run clean        # Limpar cache
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código

- ESLint para JavaScript
- Prettier para formatação
- Conventional Commits
- Testes obrigatórios para novas features

## 📝 Changelog

### v1.0.0 (2024-01-01)

- ✨ Migração completa para Node.js
- ✨ Integração com Supabase
- ✨ Interface redesenhada com TailwindCSS
- ✨ Sistema de autenticação robusto
- ✨ Painel administrativo melhorado
- ✨ Validação de dados aprimorada
- ✨ Segurança reforçada
- ✨ Performance otimizada

## 🐛 Problemas Conhecidos

- [ ] Upload de arquivos grandes pode ser lento
- [ ] Cache de imagens precisa ser implementado
- [ ] Notificações em tempo real pendentes

## 🔮 Roadmap

### v1.1.0
- [ ] Sistema de notificações
- [ ] API REST completa
- [ ] Modo offline
- [ ] PWA support

### v1.2.0
- [ ] Chat em tempo real
- [ ] Gamificação
- [ ] Relatórios avançados
- [ ] Integração com calendário

### v2.0.0
- [ ] Mobile app (React Native)
- [ ] IA para recomendações
- [ ] Análise de performance
- [ ] Marketplace de conteúdo

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@concentrify.com
- **Discord**: [Servidor da Comunidade](https://discord.gg/concentrify)
- **Documentação**: [docs.concentrify.com](https://docs.concentrify.com)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend as a Service
- [TailwindCSS](https://tailwindcss.com) - Framework CSS
- [Express.js](https://expressjs.com) - Framework Node.js
- [Font Awesome](https://fontawesome.com) - Ícones

---

<div align="center">
  <p>Feito com ❤️ pela equipe Concentrify</p>
  <p>
    <a href="https://concentrify.com">Website</a> •
    <a href="https://docs.concentrify.com">Documentação</a> •
    <a href="https://github.com/concentrify/webapp/issues">Reportar Bug</a>
  </p>
</div>