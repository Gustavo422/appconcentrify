from flask import Blueprint, render_template, session, redirect, url_for, flash, request, jsonify
from src.models.user import db
from src.models.product import Product
import os
import json

macetes_bp = Blueprint('macetes', __name__, url_prefix='/macetes')

@macetes_bp.route('/')
def index():
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    # Carregar o JSON de macetes
    json_path = os.path.join('src/static/uploads/products', 'macetes.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            macetes_data = json.load(file)
    except Exception as e:
        flash(f'Erro ao carregar macetes: {str(e)}', 'error')
        macetes_data = []
    
    # Obter todas as categorias e níveis únicos
    categorias = sorted(list(set(item['classe'] for item in macetes_data)))
    niveis = ["Básico", "Intermediário", "Especialista"]  # Ordem fixa
    
    # Obter categoria e nível da query string (se existirem)
    categoria_selecionada = request.args.get('categoria', categorias[0] if categorias else '')
    nivel_selecionado = request.args.get('nivel', 'todos')
    
    # Filtrar macetes com base na categoria e nível selecionados
    if nivel_selecionado == 'todos':
        macetes_filtrados = [m for m in macetes_data if m['classe'] == categoria_selecionada]
    else:
        macetes_filtrados = [m for m in macetes_data if m['classe'] == categoria_selecionada and m['nivel'] == nivel_selecionado]
    
    # Obter o produto para exibir informações
    produto = Product.query.filter_by(title='107 Macetes para memorizar').first()
    
    return render_template('macetes/index.html', 
                          macetes=macetes_filtrados,
                          categorias=categorias,
                          niveis=niveis,
                          categoria_selecionada=categoria_selecionada,
                          nivel_selecionado=nivel_selecionado,
                          produto=produto,
                          total_macetes=len(macetes_data))

@macetes_bp.route('/admin')
def admin():
    if not session.get('user_id') or not session.get('is_admin'):
        flash('Acesso restrito a administradores', 'error')
        return redirect(url_for('auth.login'))
    
    # Carregar o JSON de macetes
    json_path = os.path.join('src/static/uploads/products', 'macetes.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            macetes_data = json.load(file)
    except Exception as e:
        flash(f'Erro ao carregar macetes: {str(e)}', 'error')
        macetes_data = []
    
    # Obter todas as categorias e níveis únicos
    categorias = sorted(list(set(item['classe'] for item in macetes_data)))
    niveis = ["Básico", "Intermediário", "Especialista"]  # Ordem fixa
    
    return render_template('macetes/admin.html', 
                          macetes=macetes_data,
                          categorias=categorias,
                          niveis=niveis,
                          json_content=json.dumps(macetes_data, indent=2, ensure_ascii=False))

@macetes_bp.route('/admin/save', methods=['POST'])
def save():
    if not session.get('user_id') or not session.get('is_admin'):
        return jsonify({'success': False, 'message': 'Acesso restrito a administradores'})
    
    try:
        # Obter o JSON do formulário
        json_content = request.form.get('json_content')
        
        # Validar o JSON
        macetes_data = json.loads(json_content)
        
        # Salvar o JSON
        json_path = os.path.join('src/static/uploads/products', 'macetes.json')
        with open(json_path, 'w', encoding='utf-8') as file:
            json.dump(macetes_data, file, indent=2, ensure_ascii=False)
        
        return jsonify({'success': True, 'message': 'Macetes salvos com sucesso!'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao salvar macetes: {str(e)}'})

@macetes_bp.route('/admin/add', methods=['POST'])
def add():
    if not session.get('user_id') or not session.get('is_admin'):
        return jsonify({'success': False, 'message': 'Acesso restrito a administradores'})
    
    try:
        # Obter dados do formulário
        classe = request.form.get('classe')
        nivel = request.form.get('nivel')
        macete = request.form.get('macete')
        abreviacao = request.form.get('abreviacao')
        explicacao = request.form.get('explicacao')
        
        # Validar dados
        if not all([classe, nivel, macete, abreviacao, explicacao]):
            return jsonify({'success': False, 'message': 'Todos os campos são obrigatórios'})
        
        # Carregar o JSON existente
        json_path = os.path.join('src/static/uploads/products', 'macetes.json')
        with open(json_path, 'r', encoding='utf-8') as file:
            macetes_data = json.load(file)
        
        # Adicionar novo macete
        novo_macete = {
            'classe': classe,
            'nivel': nivel,
            'macete': macete,
            'abreviacao': abreviacao,
            'explicacao': explicacao
        }
        
        macetes_data.append(novo_macete)
        
        # Salvar o JSON atualizado
        with open(json_path, 'w', encoding='utf-8') as file:
            json.dump(macetes_data, file, indent=2, ensure_ascii=False)
        
        return jsonify({'success': True, 'message': 'Macete adicionado com sucesso!'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao adicionar macete: {str(e)}'})

@macetes_bp.route('/admin/delete', methods=['POST'])
def delete():
    if not session.get('user_id') or not session.get('is_admin'):
        return jsonify({'success': False, 'message': 'Acesso restrito a administradores'})
    
    try:
        # Obter índice do macete a ser excluído
        index = int(request.form.get('index'))
        
        # Carregar o JSON existente
        json_path = os.path.join('src/static/uploads/products', 'macetes.json')
        with open(json_path, 'r', encoding='utf-8') as file:
            macetes_data = json.load(file)
        
        # Verificar se o índice é válido
        if index < 0 or index >= len(macetes_data):
            return jsonify({'success': False, 'message': 'Índice inválido'})
        
        # Remover o macete
        macete_removido = macetes_data.pop(index)
        
        # Salvar o JSON atualizado
        with open(json_path, 'w', encoding='utf-8') as file:
            json.dump(macetes_data, file, indent=2, ensure_ascii=False)
        
        return jsonify({'success': True, 'message': f'Macete "{macete_removido["macete"]}" removido com sucesso!'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao remover macete: {str(e)}'})
