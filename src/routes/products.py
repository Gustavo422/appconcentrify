from flask import Blueprint, render_template, session, redirect, url_for, flash, request, send_from_directory
from src.models import db
from src.models.product import Product
import os

products_bp = Blueprint('products', __name__, url_prefix='/products')

@products_bp.route('/')
def index():
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    main_products = Product.query.filter_by(is_main=True).order_by(Product.order).all()
    bonus_products = Product.query.filter_by(is_main=False).order_by(Product.order).all()
    
    return render_template('products/index.html', 
                          main_products=main_products, 
                          bonus_products=bonus_products)

@products_bp.route('/pdf/<int:product_id>')
def view_pdf(product_id):
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    product = Product.query.get_or_404(product_id)
    
    # Mapeamento de tipos de conteúdo para suas respectivas rotas
    content_type_routes = {
        'macetes': 'macetes.index',
        'simulados': 'simulados.index',
        'questoes_semanais': 'questoes_semanais.listar_questoes_semanais'
    }
    
    # Se o tipo de conteúdo tem uma rota específica, redireciona para ela
    if product.content_type in content_type_routes:
        return redirect(url_for(content_type_routes[product.content_type]))
    
    # Se não for PDF, mostra erro
    if product.content_type != 'pdf':
        flash('Tipo de conteúdo não suportado', 'error')
        return redirect(url_for('products.index'))
    
    return render_template('products/view_pdf.html', product=product)

@products_bp.route('/get_pdf/<filename>')
def get_pdf(filename):
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    # Usar caminho absoluto para o diretório de uploads
    base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    uploads_dir = os.path.join(base_dir, 'static', 'uploads', 'products')
    
    # Verificar se o arquivo existe
    if not os.path.exists(os.path.join(uploads_dir, filename)):
        flash('Arquivo PDF não encontrado', 'error')
        return redirect(url_for('products.index'))
    
    return send_from_directory(uploads_dir, filename)
