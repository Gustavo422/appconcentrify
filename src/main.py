from datetime import datetime
import os
import sys
import json
from flask import Flask, render_template, redirect, url_for, flash, session, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

# Configurar o caminho para importações
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Importar modelos e rotas
from src.models import db
from src.models.user import User
from src.models.product import Product
from src.models.simulado import Simulado, Questao, RespostaSimulado
from src.routes.auth import auth_bp
from src.routes.admin import admin_bp
from src.routes.main import main_bp
from src.routes.products import products_bp
from src.routes.macetes import macetes_bp
from src.routes.simulados import simulados_bp
from src.routes.questoes_semanais import questoes_semanais_bp
from src.config import get_config

def create_app():
    app = Flask(__name__)
    app.config.from_object(get_config())
    
    # Adicionar variáveis globais ao contexto do template
    @app.context_processor
    def inject_now():
        return {'now': datetime.now()}
    
    # Inicializar o banco de dados
    db.init_app(app)
    
    # Registrar blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(macetes_bp)
    app.register_blueprint(simulados_bp)
    app.register_blueprint(questoes_semanais_bp)
    
    # Criar tabelas e dados iniciais
    with app.app_context():
        db.create_all()
        
        # Criar usuário admin se não existir
        if not User.query.filter_by(email='admin@concentrify.com').first():
            admin = User(
                email='admin@concentrify.com',
                is_admin=True,
                created_at=datetime.now()
            )
            db.session.add(admin)
            db.session.commit()
        
        # Criar produtos se não existirem
        if not Product.query.filter_by(title='O Fim Das 6 Malditas').first():
            product = Product(
                title='O Fim Das 6 Malditas',
                description='A capa está no seguinte link aonde voce pode baixar',
                cover_image='fim_das_6_malditas.png',
                pdf_file='fim_das_6_malditas.pdf',
                is_main=True,
                content_type='pdf',
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
                content_type='pdf',
                order=2
            )
            db.session.add(product)
            db.session.commit()
        
        if not Product.query.filter_by(title='107 Macetes para memorizar').first():
            product = Product(
                title='107 Macetes para memorizar',
                description='107 truques e abreviações para memorizar rapidamente conteúdos de Biologia, História, Geografia, Português, Exatas, etc.',
                cover_image='macetes.png',
                pdf_file='macetes.json',
                is_main=False,
                content_type='macetes',
                order=1
            )
            db.session.add(product)
            db.session.commit()
            
        if not Product.query.filter_by(title='30 simulados personalizados').first():
            product = Product(
                title='30 simulados personalizados',
                description='Escolha entre 30 simulados pra voce responder com base no concurso que voce quer prestar.',
                cover_image='simulados.png',
                pdf_file='simulados.json',
                is_main=True,
                content_type='simulados',
                order=3
            )
            db.session.add(product)
            db.session.commit()
            
        if not Product.query.filter_by(title='100 Questões Semanais').first():
            product = Product(
                title='100 Questões Semanais',
                description='Pratique com questões semanais organizadas por matéria e nível de dificuldade.',
                cover_image='cem_questoes_semanais.png',
                pdf_file='questoes_semanais.json',
                is_main=False,
                content_type='questoes_semanais',
                order=2
            )
            db.session.add(product)
            db.session.commit()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0')
