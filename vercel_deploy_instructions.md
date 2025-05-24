# Instruções para Deploy no Vercel

Este documento contém instruções detalhadas para fazer o deploy do webapp Concentrify no Vercel.

## Pré-requisitos

1. Uma conta no [Vercel](https://vercel.com)
2. Git instalado em sua máquina local
3. Node.js instalado em sua máquina local

## Preparação do Projeto para o Vercel

Para que o projeto Flask funcione corretamente no Vercel, precisamos fazer algumas adaptações:

### 1. Criar arquivo `vercel.json`

Crie um arquivo chamado `vercel.json` na raiz do projeto com o seguinte conteúdo:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.py"
    }
  ]
}
```

### 2. Adaptar o banco de dados

Como o Vercel não suporta SQLite (por ser um serviço serverless sem persistência de arquivos), você precisará usar um banco de dados externo. Recomendamos:

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (tem plano gratuito)
- [Supabase](https://supabase.com) (tem plano gratuito)
- [ElephantSQL](https://www.elephantsql.com) (PostgreSQL como serviço, tem plano gratuito)

Após criar uma conta em um desses serviços, você precisará modificar a configuração do banco de dados no arquivo `src/main.py`:

```python
# Substitua a linha do SQLite por:
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
```

### 3. Criar arquivo `requirements.txt`

Certifique-se de que o arquivo `requirements.txt` na raiz do projeto contenha todas as dependências:

```
flask==3.1.1
flask-sqlalchemy==3.1.1
flask-wtf==1.2.2
gunicorn==21.2.0
# Adicione o driver do banco de dados que você escolheu:
# Para PostgreSQL: psycopg2-binary
# Para MongoDB: pymongo
```

## Deploy no Vercel

1. Faça login no Vercel: https://vercel.com/login
2. Crie um novo projeto no Vercel
3. Conecte ao seu repositório Git ou faça upload do projeto
4. Configure as variáveis de ambiente:
   - `SECRET_KEY`: Uma string aleatória para segurança
   - `DATABASE_URL`: A URL de conexão do seu banco de dados

5. Clique em "Deploy" e aguarde a conclusão

## Configuração Pós-Deploy

Após o deploy, você precisará criar o usuário administrador inicial. Como o Vercel não permite executar scripts diretamente, você tem duas opções:

1. Adicione um endpoint temporário para criar o admin:

```python
@app.route('/setup-admin')
def setup_admin():
    # Verifique se já existe um admin
    if User.query.filter_by(email='admin@concentrify.com').first():
        return "Admin já existe"
    
    # Crie o admin
    admin = User(email='admin@concentrify.com', is_admin=True)
    db.session.add(admin)
    db.session.commit()
    return "Admin criado com sucesso"
```

2. Use o console do seu serviço de banco de dados para inserir o usuário manualmente

## Testando o Deploy

1. Acesse a URL fornecida pelo Vercel após o deploy
2. Faça login com o email de administrador: `admin@concentrify.com`
3. Verifique se todas as funcionalidades estão operando corretamente

## Solução de Problemas

Se encontrar problemas durante o deploy:

1. Verifique os logs no dashboard do Vercel
2. Certifique-se de que todas as variáveis de ambiente estão configuradas corretamente
3. Verifique se o banco de dados está acessível a partir do Vercel (alguns serviços requerem configuração de IP permitido)

## Recursos Adicionais

- [Documentação do Vercel para Python](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Documentação do Flask](https://flask.palletsprojects.com/)
- [Documentação do SQLAlchemy](https://docs.sqlalchemy.org/)
