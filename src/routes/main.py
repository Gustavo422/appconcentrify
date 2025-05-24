from flask import Blueprint, render_template, session, redirect, url_for, flash

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    if session.get('user_id'):
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('auth.login'))

@main_bp.route('/dashboard')
def dashboard():
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    return render_template('public/dashboard.html')
