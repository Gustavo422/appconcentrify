from datetime import datetime
from flask import Flask, flash
from src.models.user import db, User
from src.routes.auth import auth_bp
from src.routes.admin import admin_bp
from src.routes.main import main_bp
from src.routes.products import products_bp
from src.models.product import Product
import os

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
    app.register_blueprint(products_bp)
    
    # Cria tabelas do banco de dados
    with app.app_context():
        db.create_all()
        
        # Cria um usuário admin se não existir
        if not User.query.filter_by(email='admin@concentrify.com').first():
            admin = User(email='admin@concentrify.com', is_admin=True)
            db.session.add(admin)
            db.session.commit()
        
        # Cria o primeiro produto se não existir
        if not Product.query.filter_by(title='O Fim Das 6 Malditas').first():
            product = Product(
                title='O Fim Das 6 Malditas',
                description='Guia Prático com vários métodos validos para eliminar as 6 distrações que mais te atrasam',
                cover_image='fim_das_6_malditas.png',
                pdf_file='fim_das_6_malditas.pdf',
                is_main=True,
                order=1
            )
            db.session.add(product)
            db.session.commit()
        
        if not Product.query.filter_by(title='Método Memória de Elefante').first():
            product = Product(
                title='Método Memória de Elefante',
                description='Método simples para decorar qualquer matéria com ou conceito com facilidade',
                cover_image='memoria_elefante.png',
                pdf_file='memoria_elefante.pdf',
                is_main=True,
                order=2
            )
            db.session.add(product)
            db.session.commit()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
