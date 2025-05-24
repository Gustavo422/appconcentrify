import os
import sys
from flask import Flask, flash
from src.models.user import db, User
from src.routes.auth import auth_bp
from src.routes.admin import admin_bp
from src.routes.main import main_bp

def create_app():
    app = Flask(__name__)
    
    # Configuração
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'chave_secreta_desenvolvimento')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///concentrify.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializa extensões
    db.init_app(app)
    
    # Registra blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(main_bp)
    
    # Cria tabelas do banco de dados
    with app.app_context():
        db.create_all()
        
        # Cria um usuário admin se não existir
        if not User.query.filter_by(email='admin@concentrify.com').first():
            admin = User(email='admin@concentrify.com', is_admin=True)
            db.session.add(admin)
            db.session.commit()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
