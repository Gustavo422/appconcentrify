import os
from src.app import create_app
from src.config import get_config

# Configurar o ambiente
os.environ.setdefault('FLASK_ENV', 'development')

# Criar a aplicação
app = create_app()

# Configurar a aplicação
app.config.from_object(get_config())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 