from flask import Blueprint, render_template, request, jsonify, current_app
from src.models import db, QuestoesSemanais, QuestaoSemanal, RespostaQuestaoSemanal
from datetime import datetime
import os
import json

questoes_semanais_bp = Blueprint('questoes_semanais', __name__)

@questoes_semanais_bp.route('/questoes-semanais')
def listar_questoes_semanais():
    """Lista todas as questões semanais disponíveis"""
    questoes_semanais = QuestoesSemanais.query.filter_by(status='ativo').order_by(
        QuestoesSemanais.semana_referencia.desc()
    ).all()
    return render_template('questoes_semanais/lista.html', questoes_semanais=questoes_semanais)

@questoes_semanais_bp.route('/questoes-semanais/<int:id>')
def visualizar_questoes_semanais(id):
    """Visualiza uma questão semanal específica"""
    questoes_semanais = QuestoesSemanais.query.get_or_404(id)
    return render_template('questoes_semanais/visualizar.html', questoes_semanais=questoes_semanais)

@questoes_semanais_bp.route('/questoes-semanais/<int:id>/responder')
def responder_questoes_semanais(id):
    """Interface para responder as questões semanais"""
    questoes_semanais = QuestoesSemanais.query.get_or_404(id)
    return render_template('questoes_semanais/responder.html', questoes_semanais=questoes_semanais)

@questoes_semanais_bp.route('/questoes-semanais/<int:id>/respostas', methods=['POST'])
def salvar_respostas(id):
    """Salva as respostas do usuário para as questões semanais"""
    data = request.get_json()
    user_id = data.get('user_id')  # Assumindo que o user_id vem do frontend
    respostas = data.get('respostas', [])
    
    questoes_semanais = QuestoesSemanais.query.get_or_404(id)
    
    # Salva cada resposta
    for resposta_data in respostas:
        questao_id = resposta_data.get('questao_id')
        resposta = resposta_data.get('resposta')
        tempo_gasto = resposta_data.get('tempo_gasto')
        
        questao = QuestaoSemanal.query.get(questao_id)
        if not questao:
            continue
        
        acertou = resposta == questao.resposta_correta
        
        nova_resposta = RespostaQuestaoSemanal(
            user_id=user_id,
            questoes_semanais_id=id,
            questao_id=questao_id,
            resposta=resposta,
            acertou=acertou,
            tempo_gasto=tempo_gasto
        )
        db.session.add(nova_resposta)
    
    db.session.commit()
    return jsonify({'message': 'Respostas salvas com sucesso'})

# Rotas administrativas
@questoes_semanais_bp.route('/admin/questoes-semanais', methods=['GET', 'POST'])
def admin_questoes_semanais():
    """Interface administrativa para gerenciar questões semanais"""
    if request.method == 'POST':
        data = request.form
        
        # Criar nova questão semanal
        questoes_semanais = QuestoesSemanais(
            titulo=data.get('titulo'),
            descricao=data.get('descricao'),
            semana_referencia=datetime.strptime(data.get('semana_referencia'), '%Y-%m-%d').date()
        )
        
        # Processar arquivo JSON se fornecido
        if 'arquivo_json' in request.files:
            arquivo = request.files['arquivo_json']
            if arquivo.filename:
                # Salvar arquivo
                filename = f"questoes_semanais_{questoes_semanais.semana_referencia}.json"
                arquivo_path = os.path.join(current_app.static_folder, 'uploads', 'questoes_semanais', filename)
                os.makedirs(os.path.dirname(arquivo_path), exist_ok=True)
                arquivo.save(arquivo_path)
                
                # Carregar questões do JSON
                with open(arquivo_path, 'r', encoding='utf-8') as f:
                    questoes_data = json.load(f)
                
                # Criar questões
                for i, questao_data in enumerate(questoes_data, 1):
                    questao = QuestaoSemanal(
                        questoes_semanais_id=questoes_semanais.id,
                        materia=questao_data['materia'],
                        enunciado=questao_data['enunciado'],
                        alternativa_a=questao_data['alternativas']['A'],
                        alternativa_b=questao_data['alternativas']['B'],
                        alternativa_c=questao_data['alternativas']['C'],
                        alternativa_d=questao_data['alternativas']['D'],
                        alternativa_e=questao_data['alternativas']['E'],
                        resposta_correta=questao_data['correta'],
                        numero_questao=i,
                        nivel_dificuldade=questao_data.get('nivel_dificuldade', 'médio')
                    )
                    db.session.add(questao)
                
                questoes_semanais.total_questoes = len(questoes_data)
                questoes_semanais.materias = ','.join(set(q['materia'] for q in questoes_data))
                questoes_semanais.arquivo_json = arquivo_path
        
        db.session.add(questoes_semanais)
        db.session.commit()
        
        return jsonify({'message': 'Questões semanais criadas com sucesso', 'id': questoes_semanais.id})
    
    # GET: Listar todas as questões semanais
    questoes_semanais = QuestoesSemanais.query.order_by(
        QuestoesSemanais.semana_referencia.desc()
    ).all()
    return render_template('questoes_semanais/admin/lista.html', questoes_semanais=questoes_semanais)

@questoes_semanais_bp.route('/admin/questoes-semanais/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def admin_questoes_semanais_detalhes(id):
    """Gerenciar uma questão semanal específica"""
    questoes_semanais = QuestoesSemanais.query.get_or_404(id)
    
    if request.method == 'DELETE':
        db.session.delete(questoes_semanais)
        db.session.commit()
        return jsonify({'message': 'Questões semanais removidas com sucesso'})
    
    if request.method == 'PUT':
        data = request.get_json()
        
        questoes_semanais.titulo = data.get('titulo', questoes_semanais.titulo)
        questoes_semanais.descricao = data.get('descricao', questoes_semanais.descricao)
        questoes_semanais.status = data.get('status', questoes_semanais.status)
        
        if 'semana_referencia' in data:
            questoes_semanais.semana_referencia = datetime.strptime(
                data['semana_referencia'], '%Y-%m-%d'
            ).date()
        
        db.session.commit()
        return jsonify({'message': 'Questões semanais atualizadas com sucesso'})
    
    # GET: Mostrar detalhes
    return render_template(
        'questoes_semanais/admin/detalhes.html',
        questoes_semanais=questoes_semanais
    ) 