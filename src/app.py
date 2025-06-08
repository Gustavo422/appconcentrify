from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
import logging
from src.config import get_config
from src.models import db
from src.routes import auth, simulados, questoes_semanais

# Inicializar extensões
db = SQLAlchemy()
migrate = Migrate()

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Definir diretório de upload globalmente
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'static', 'uploads', 'simulados')

def create_app():
    app = Flask(__name__)
    app.config.from_object(get_config())
    
    # Garantir que o diretório de upload existe
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        if not os.path.exists(UPLOAD_DIR):
            raise RuntimeError(f"Diretório de upload não pôde ser criado: {UPLOAD_DIR}")
        if not os.access(UPLOAD_DIR, os.W_OK):
            raise RuntimeError(f"Sem permissão de escrita no diretório de upload: {UPLOAD_DIR}")
        
        # Definir a configuração UPLOAD_FOLDER
        app.config['UPLOAD_FOLDER'] = UPLOAD_DIR
        logger.info(f"Diretório de upload configurado: {UPLOAD_DIR}")
        
    except Exception as e:
        logger.error(f"Erro ao configurar diretório de upload: {str(e)}")
        raise
    
    # Inicializar extensões com o app
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Registrar blueprints
    app.register_blueprint(auth.bp)
    app.register_blueprint(simulados.bp)
    app.register_blueprint(questoes_semanais.bp)
    
    # Criar diretório de uploads de produtos
    os.makedirs(os.path.join(BASE_DIR, 'static', 'uploads', 'products'), exist_ok=True)
    
    # Verificar se a configuração foi definida corretamente
    if 'UPLOAD_FOLDER' not in app.config:
        logger.error("UPLOAD_FOLDER não foi definido na configuração do app")
        raise RuntimeError("UPLOAD_FOLDER não foi definido na configuração do app")
    
    logger.info(f"Configuração UPLOAD_FOLDER: {app.config['UPLOAD_FOLDER']}")
    
    return app 