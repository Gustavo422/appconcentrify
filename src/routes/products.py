from flask import Blueprint, render_template, session, redirect, url_for, flash, request, send_from_directory, abort
from src.models.user import db
from src.models.product import Product
import os

products_bp = Blueprint('products', __name__, url_prefix='/products')

@products_bp.route('/')
def index():
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    # Buscar produtos principais e bônus
    main_products = Product.query.filter_by(is_main=True).order_by(Product.order).all()
    bonus_products = Product.query.filter_by(is_main=False).order_by(Product.order).all()
    
    return render_template('products/index.html', 
                          main_products=main_products, 
                          bonus_products=bonus_products)

@products_bp.route('/<int:id>')
def view(id):
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    product = Product.query.get_or_404(id)
    
    return render_template('products/view.html', product=product)

@products_bp.route('/pdf/<int:id>')
def view_pdf(id):
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    product = Product.query.get_or_404(id)
    
    if not product.pdf_file or not os.path.exists(os.path.join('src/static/uploads/products', product.pdf_file)):
        abort(404)
    
    return render_template('products/view_pdf.html', product=product)

@products_bp.route('/pdf-file/<filename>')
def get_pdf(filename):
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    return send_from_directory('static/uploads/products', filename)
