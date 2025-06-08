from flask import Blueprint, render_template, session, redirect, url_for, flash
from src.models.product import Product

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    if session.get('user_id'):
        return redirect(url_for('products.index'))
    return redirect(url_for('auth.login'))

@main_bp.route('/dashboard')
def dashboard():
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    # Buscar produtos do banco de dados
    main_products = Product.query.filter_by(is_main=True).order_by(Product.order).all()
    bonus_products = Product.query.filter_by(is_main=False).order_by(Product.order).all()
    
    return render_template('public/dashboard.html', 
                         main_products=main_products, 
                         bonus_products=bonus_products)
