# Concentrify WebApp

Aplicação web para gerenciamento de conteúdo educacional, simulados e macetes para concursos.

## Requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)
- virtualenv (recomendado)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/concentrify_webapp.git
cd concentrify_webapp
```

2. Crie e ative um ambiente virtual:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Configure as variáveis de ambiente:
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
```

5. Inicialize o banco de dados:
```bash
python src/scripts/init_db.py
```

## Executando a aplicação

### Ambiente de desenvolvimento

```bash
# Ative o ambiente virtual se ainda não estiver ativo
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Execute a aplicação
python wsgi.py
```

A aplicação estará disponível em `http://localhost:5000`

### Ambiente de produção

1. Configure as variáveis de ambiente para produção:
   - Edite o arquivo `.env`
   - Defina `FLASK_ENV=production`
   - Defina `FLASK_DEBUG=0`
   - Configure uma chave secreta forte
   - Configure o banco de dados apropriado

2. Execute a aplicação usando um servidor WSGI como Gunicorn:
```bash
gunicorn wsgi:app
```

## Estrutura do Projeto

```
concentrify_webapp/
├── src/                    # Código fonte da aplicação
│   ├── models/            # Modelos do banco de dados
│   ├── routes/            # Rotas da aplicação
│   ├── templates/         # Templates HTML
│   ├── static/            # Arquivos estáticos (CSS, JS, imagens)
│   ├── utils/             # Funções utilitárias
│   ├── scripts/           # Scripts de utilidade
│   ├── config.py          # Configurações da aplicação
│   └── app.py             # Factory da aplicação
├── migrations/            # Migrações do banco de dados
├── instance/             # Arquivos de instância (banco de dados, etc)
├── tests/                # Testes automatizados
├── requirements.txt      # Dependências do projeto
├── wsgi.py              # Ponto de entrada WSGI
└── README.md            # Este arquivo
```

## Funcionalidades

- Sistema de autenticação de usuários
- Gerenciamento de produtos educacionais
- Sistema de simulados personalizados
- Macetes e técnicas de memorização
- Área administrativa

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 