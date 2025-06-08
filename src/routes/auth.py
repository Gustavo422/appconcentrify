from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from datetime import datetime
from src.models.user import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        
        if not email:
            flash('Email é obrigatório', 'error')
            return render_template('public/login.html')
        
        # Verifica se o usuário existe
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Atualiza o último login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Cria a sessão
            session.permanent = True  # Torna a sessão permanente
            session['user_id'] = user.id
            session['email'] = user.email
            session['is_admin'] = user.is_admin
            
            flash('Login realizado com sucesso!', 'success')
            
            if user.is_admin:
                return redirect(url_for('admin.dashboard'))
            else:
                return redirect(url_for('products.index'))  # Redireciona para produtos em vez de dashboard
        else:
            flash('Email não encontrado', 'error')
    
    return render_template('public/login.html')

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('Você foi desconectado', 'info')
    return redirect(url_for('auth.login'))
