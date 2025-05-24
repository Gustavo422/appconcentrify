from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from src.models.user import db, User

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/')
def dashboard():
    if not session.get('is_admin'):
        flash('Acesso restrito a administradores', 'error')
        return redirect(url_for('auth.login'))
    
    users = User.query.all()
    return render_template('admin/dashboard.html', users=users)

@admin_bp.route('/users')
def list_users():
    if not session.get('is_admin'):
        flash('Acesso restrito a administradores', 'error')
        return redirect(url_for('auth.login'))
    
    users = User.query.all()
    return render_template('admin/users.html', users=users)

@admin_bp.route('/users/new', methods=['GET', 'POST'])
def new_user():
    if not session.get('is_admin'):
        flash('Acesso restrito a administradores', 'error')
        return redirect(url_for('auth.login'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        is_admin = 'is_admin' in request.form
        
        if not email:
            flash('Email é obrigatório', 'error')
            return render_template('admin/user_form.html')
        
        # Verifica se o email já existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Este email já está cadastrado', 'error')
            return render_template('admin/user_form.html')
        
        # Cria novo usuário
        user = User(email=email, is_admin=is_admin)
        db.session.add(user)
        db.session.commit()
        
        flash('Usuário criado com sucesso!', 'success')
        return redirect(url_for('admin.list_users'))
    
    return render_template('admin/user_form.html')

@admin_bp.route('/users/<int:id>/edit', methods=['GET', 'POST'])
def edit_user(id):
    if not session.get('is_admin'):
        flash('Acesso restrito a administradores', 'error')
        return redirect(url_for('auth.login'))
    
    user = User.query.get_or_404(id)
    
    if request.method == 'POST':
        email = request.form.get('email')
        is_admin = 'is_admin' in request.form
        
        if not email:
            flash('Email é obrigatório', 'error')
            return render_template('admin/user_form.html', user=user)
        
        # Verifica se o email já existe (exceto para o usuário atual)
        existing_user = User.query.filter(User.email == email, User.id != id).first()
        if existing_user:
            flash('Este email já está cadastrado para outro usuário', 'error')
            return render_template('admin/user_form.html', user=user)
        
        # Atualiza o usuário
        user.email = email
        user.is_admin = is_admin
        db.session.commit()
        
        flash('Usuário atualizado com sucesso!', 'success')
        return redirect(url_for('admin.list_users'))
    
    return render_template('admin/user_form.html', user=user)

@admin_bp.route('/users/<int:id>/delete', methods=['POST'])
def delete_user(id):
    if not session.get('is_admin'):
        flash('Acesso restrito a administradores', 'error')
        return redirect(url_for('auth.login'))
    
    user = User.query.get_or_404(id)
    
    # Não permite excluir o próprio usuário
    if user.id == session.get('user_id'):
        flash('Você não pode excluir seu próprio usuário', 'error')
        return redirect(url_for('admin.list_users'))
    
    db.session.delete(user)
    db.session.commit()
    
    flash('Usuário excluído com sucesso!', 'success')
    return redirect(url_for('admin.list_users'))
