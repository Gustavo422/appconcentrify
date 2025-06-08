from flask import Blueprint, render_template, session, redirect, url_for, flash, request, jsonify, current_app
from src.models import db
from src.models.simulado import Simulado, Questao, RespostaSimulado
from src.models.product import Product
import os
import json
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

simulados_bp = Blueprint('simulados', __name__, url_prefix='/simulados')

def get_upload_folder():
    """Obtém o diretório de simulados."""
    upload_folder = os.path.join('src', 'static', 'uploads', 'simulados')
    if not os.path.exists(upload_folder):
        logger.error(f"Diretório de simulados não existe: {upload_folder}")
        raise RuntimeError(f"Diretório de simulados não existe: {upload_folder}")
    
    return upload_folder

# Rotas públicas
@simulados_bp.route('/')
def index():
    """Página inicial dos simulados."""
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    # Carregar simulados dos arquivos JSON
    simulados = []
    materias = set()
    
    try:
        upload_folder = get_upload_folder()
        print(f"Procurando simulados em: {upload_folder}")
        
        if os.path.exists(upload_folder):
            for arquivo in os.listdir(upload_folder):
                if arquivo.endswith('.json'):
                    caminho_completo = os.path.join(upload_folder, arquivo)
                    print(f"Encontrado arquivo: {arquivo}")
                    try:
                        with open(caminho_completo, 'r', encoding='utf-8') as f:
                            dados = json.load(f)
                            
                            # Calcular total de questões
                            total_questoes = 0
                            materias_simulado = set()
                            for area in dados.get('areas_conhecimento', []):
                                materias_simulado.add(area.get('materia', ''))
                                total_questoes += len(area.get('questoes', []))
                            
                            materias.update(materias_simulado)
                            
                            # Usar o nome do arquivo sem extensão como ID
                            simulado_id = os.path.splitext(arquivo)[0]
                            print(f"ID do simulado: {simulado_id}")
                            
                            simulado = {
                                'id': simulado_id,
                                'titulo': dados.get('titulo', 'Sem título'),
                                'descricao': dados.get('descricao', ''),
                                'total_questoes': total_questoes,
                                'materias': sorted(list(materias_simulado)),
                                'arquivo': arquivo,
                                'data_modificacao': datetime.fromtimestamp(os.path.getmtime(caminho_completo))
                            }
                            simulados.append(simulado)
                    except Exception as e:
                        print(f'Erro ao ler arquivo {arquivo}: {str(e)}')
                        continue
    except Exception as e:
        print(f'Erro ao listar simulados: {str(e)}')
        flash('Erro ao carregar simulados', 'error')
    
    # Ordenar simulados por data de modificação (mais recente primeiro)
    simulados.sort(key=lambda x: x['data_modificacao'], reverse=True)
    
    # Obter matéria da query string (se existir)
    materia_selecionada = request.args.get('materia', 'todas')
    
    # Filtrar simulados por matéria
    if materia_selecionada != 'todas':
        simulados = [s for s in simulados if materia_selecionada in s['materias']]
    
    # Obter o produto para exibir informações
    produto = Product.query.filter_by(title='30 simulados personalizados').first()
    
    return render_template('simulados/index.html',
                         simulados=simulados,
                         materias=sorted(list(materias)),
                         materia_selecionada=materia_selecionada,
                         produto=produto)

@simulados_bp.route('/iniciar/<string:simulado_id>')
def iniciar(simulado_id):
    """Inicia um simulado."""
    print("="*50)
    print("INICIANDO SIMULADO")
    print(f"Simulado ID: {simulado_id}")
    print(f"Sessão atual: {dict(session)}")
    
    if not session.get('user_id'):
        print("Usuário não está logado")
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    # Carregar simulado do arquivo JSON
    upload_folder = get_upload_folder()
    caminho_arquivo = os.path.join(upload_folder, f"{simulado_id}.json")
    
    if not os.path.exists(caminho_arquivo):
        print(f"Arquivo não encontrado: {caminho_arquivo}")
        flash('Simulado não encontrado', 'error')
        return redirect(url_for('simulados.index'))
    
    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as f:
            dados = json.load(f)
        
        # Preparar questões
        questoes = []
        numero_questao = 1
        
        for area in dados.get('areas_conhecimento', []):
            for questao in area.get('questoes', []):
                questoes.append({
                    'id': numero_questao,
                    'materia': area.get('materia', ''),
                    'enunciado': questao.get('enunciado', ''),
                    'alternativas': questao.get('alternativas', {}),
                    'correta': questao.get('correta', ''),
                    'numero': numero_questao
                })
                numero_questao += 1
        
        if not questoes:
            print("Simulado sem questões")
            flash('Simulado não possui questões', 'error')
            return redirect(url_for('simulados.index'))
        
        # Salvar na sessão
        session['simulado'] = {
            'id': simulado_id,
            'titulo': dados.get('titulo', 'Sem título'),
            'questoes': questoes,
            'respostas': {},
            'tempo_inicio': datetime.now().timestamp()
        }
        
        print("Sessão após salvar:")
        print(f"- simulado: {session.get('simulado')}")
        
        # Ir para primeira questão
        return redirect(url_for('simulados.questao', simulado_id=simulado_id, numero=1))
    
    except Exception as e:
        print(f"Erro ao iniciar simulado: {str(e)}")
        flash('Erro ao iniciar simulado', 'error')
        return redirect(url_for('simulados.index'))

@simulados_bp.route('/<string:simulado_id>/questao/<int:numero>', methods=['GET', 'POST'])
def questao(simulado_id, numero):
    """Exibe e processa uma questão do simulado."""
    print(f"Tentando acessar simulado: {simulado_id}, questão: {numero}")
    
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    # Carregar simulado do arquivo JSON
    upload_folder = get_upload_folder()
    caminho_arquivo = os.path.join(upload_folder, f"{simulado_id}.json")
    print(f"Procurando arquivo em: {caminho_arquivo}")
    
    if not os.path.exists(caminho_arquivo):
        print(f"Arquivo não encontrado: {caminho_arquivo}")
        flash('Simulado não encontrado', 'error')
        return redirect(url_for('simulados.index'))
    
    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as f:
            dados = json.load(f)
            print(f"Arquivo carregado com sucesso: {simulado_id}.json")
        
        # Preparar questões
        questoes = []
        numero_questao = 1
        
        for area in dados.get('areas_conhecimento', []):
            for questao in area.get('questoes', []):
                questoes.append({
                    'id': numero_questao,
                    'materia': area.get('materia', ''),
                    'enunciado': questao.get('enunciado', ''),
                    'alternativas': questao.get('alternativas', {}),
                    'correta': questao.get('correta', ''),
                    'numero': numero_questao
                })
                numero_questao += 1
        
        print(f"Total de questões carregadas: {len(questoes)}")
        
        if not questoes:
            print("Simulado não possui questões")
            flash('Simulado não possui questões', 'error')
            return redirect(url_for('simulados.index'))
        
        # Verificar se o número da questão é válido
        if numero < 1 or numero > len(questoes):
            print(f"Número da questão inválido: {numero}")
            flash('Questão não encontrada', 'error')
            return redirect(url_for('simulados.index'))
        
        # Obter a questão específica
        questao_atual = questoes[numero - 1]
        
        # Se for POST, processar a resposta
        if request.method == 'POST':
            resposta = request.form.get(f'resposta_{numero}')
            if resposta:
                # Salvar resposta na sessão
                if 'simulado' not in session:
                    session['simulado'] = {}
                if 'respostas' not in session['simulado']:
                    session['simulado']['respostas'] = {}
                
                session['simulado']['respostas'][str(numero - 1)] = resposta
                session.modified = True
                print(f"Resposta salva: {resposta} para questão {numero}")
            
            # Se não for a última questão, ir para a próxima
            if numero < len(questoes):
                return redirect(url_for('simulados.questao', simulado_id=simulado_id, numero=numero + 1))
        
        # Se for a primeira questão, iniciar o timer
        tempo_inicio = request.args.get('tempo_inicio', datetime.now().timestamp())
        
        # Obter resposta salva (se existir)
        resposta_salva = None
        if 'simulado' in session and 'respostas' in session['simulado']:
            resposta_salva = session['simulado']['respostas'].get(str(numero - 1))
        
        return render_template('simulados/questao.html',
                             questao=questao_atual,
                             total_questoes=len(questoes),
                             simulado={'id': simulado_id, 'titulo': dados.get('titulo', 'Sem título')},
                             tempo_inicio=tempo_inicio,
                             resposta_salva=resposta_salva)
    
    except Exception as e:
        print(f'Erro ao carregar questão: {str(e)}')
        flash('Erro ao carregar questão', 'error')
        return redirect(url_for('simulados.index'))

@simulados_bp.route('/<string:simulado_id>/resultado', methods=['GET', 'POST'])
def resultado(simulado_id):
    """Exibe o resultado do simulado."""
    if not session.get('user_id'):
        flash('Faça login para acessar esta página', 'error')
        return redirect(url_for('auth.login'))
    
    # Carregar simulado do arquivo JSON
    upload_folder = get_upload_folder()
    caminho_arquivo = os.path.join(upload_folder, f"{simulado_id}.json")
    
    if not os.path.exists(caminho_arquivo):
        flash('Simulado não encontrado', 'error')
        return redirect(url_for('simulados.index'))
    
    try:
        # Carregar dados do simulado
        with open(caminho_arquivo, 'r', encoding='utf-8') as f:
            dados = json.load(f)
        
        # Preparar questões
        questoes = []
        numero_questao = 1
        for area in dados.get('areas_conhecimento', []):
            for questao in area.get('questoes', []):
                questoes.append({
                    'id': numero_questao,
                    'materia': area.get('materia', ''),
                    'enunciado': questao.get('enunciado', ''),
                    'alternativas': questao.get('alternativas', {}),
                    'correta': questao.get('correta', ''),
                    'numero': numero_questao
                })
                numero_questao += 1
        
        # Processar tempo
        tempo_inicio = float(request.form.get('tempo_inicio', datetime.now().timestamp()))
        tempo_fim = datetime.now().timestamp()
        tempo_total_segundos = int(tempo_fim - tempo_inicio)
        minutos = tempo_total_segundos // 60
        segundos = tempo_total_segundos % 60
        tempo_total = f"{minutos} minutos e {segundos} segundos"
        
        # Processar respostas
        respostas = {}
        
        # Primeiro, tentar obter respostas do formulário
        if request.method == 'POST':
            for questao in questoes:
                resposta = request.form.get(f'resposta_{questao["numero"]}')
                if resposta:
                    respostas[str(questao["numero"] - 1)] = resposta
        
        # Se não houver respostas no formulário, tentar obter da sessão
        if not respostas and 'simulado' in session and 'respostas' in session['simulado']:
            respostas = session['simulado']['respostas']
        
        # Calcular resultados
        total_questoes = len(questoes)
        respondidas = len(respostas)
        acertos = 0
        questoes_resultado = []
        desempenho_materias = {}
        
        # Processar cada questão
        for i, questao in enumerate(questoes):
            resposta_dada = respostas.get(str(i), '')
            resposta_correta = questao['correta']
            acertou = resposta_dada == resposta_correta
            
            if acertou:
                acertos += 1
            
            # Atualizar estatísticas por matéria
            materia = questao['materia']
            if materia not in desempenho_materias:
                desempenho_materias[materia] = {'total': 0, 'acertos': 0, 'erros': 0}
            
            desempenho_materias[materia]['total'] += 1
            if acertou:
                desempenho_materias[materia]['acertos'] += 1
            else:
                desempenho_materias[materia]['erros'] += 1
            
            # Adicionar questão ao resultado
            questoes_resultado.append({
                'numero': i + 1,
                'materia': materia,
                'enunciado': questao['enunciado'],
                'alternativas': questao['alternativas'],
                'resposta_usuario': resposta_dada,
                'resposta_correta': resposta_correta,
                'acertou': acertou
            })
        
        # Calcular porcentagens
        percentual_acertos = (acertos / total_questoes) * 100 if total_questoes > 0 else 0
        
        for materia in desempenho_materias:
            total = desempenho_materias[materia]['total']
            acertos_materia = desempenho_materias[materia]['acertos']
            desempenho_materias[materia]['percentual'] = (acertos_materia / total) * 100 if total > 0 else 0
        
        # Determinar chance de classificação
        if percentual_acertos >= 90:
            chance_classificacao = "Excelente! Suas chances de classificação são muito altas."
        elif percentual_acertos >= 80:
            chance_classificacao = "Muito bom! Suas chances de classificação são altas."
        elif percentual_acertos >= 70:
            chance_classificacao = "Bom! Você tem boas chances de classificação."
        elif percentual_acertos >= 60:
            chance_classificacao = "Regular. Suas chances de classificação são moderadas."
        elif percentual_acertos >= 50:
            chance_classificacao = "Atenção! Suas chances de classificação são baixas."
        else:
            chance_classificacao = "Precisa melhorar. Suas chances de classificação são muito baixas."
        
        # Limpar dados do simulado da sessão
        if 'simulado' in session:
            session.pop('simulado')
            session.modified = True
        
        # Renderizar template com resultados
        return render_template('simulados/resultado.html',
                             simulado={'id': simulado_id, 'titulo': dados.get('titulo', 'Sem título')},
                             total_questoes=total_questoes,
                             respondidas=respondidas,
                             acertos=acertos,
                             percentual_acertos=percentual_acertos,
                             chance_classificacao=chance_classificacao,
                             questoes=questoes_resultado,
                             desempenho_materias=desempenho_materias,
                             tempo_total=tempo_total)
    
    except Exception as e:
        print(f'Erro ao carregar resultado: {str(e)}')
        flash('Erro ao carregar resultado', 'error')
        return redirect(url_for('simulados.index'))

# Rota administrativa simplificada - apenas para visualização
@simulados_bp.route('/admin')
def admin():
    """Página administrativa dos simulados - apenas visualização."""
    if not session.get('user_id') or not session.get('is_admin'):
        flash('Acesso restrito a administradores', 'error')
        return redirect(url_for('auth.login'))
    
    # Listar arquivos JSON do diretório
    simulados = []
    
    try:
        upload_folder = get_upload_folder()
        logger.debug(f"Usando diretório de simulados: {upload_folder}")
        
        if os.path.exists(upload_folder):
            for arquivo in os.listdir(upload_folder):
                if arquivo.endswith('.json'):
                    caminho_completo = os.path.join(upload_folder, arquivo)
                    data_modificacao = datetime.fromtimestamp(os.path.getmtime(caminho_completo))
                    tamanho = os.path.getsize(caminho_completo)
                    
                    # Tentar ler o título do simulado do arquivo JSON
                    try:
                        with open(caminho_completo, 'r', encoding='utf-8') as f:
                            dados = json.load(f)
                            titulo = dados.get('titulo', 'Sem título')
                            
                            # Calcular total de questões e matérias
                            total_questoes = 0
                            materias = set()
                            for area in dados.get('areas_conhecimento', []):
                                materias.add(area.get('materia', ''))
                                total_questoes += len(area.get('questoes', []))
                            
                            simulados.append({
                                'arquivo': arquivo,
                                'titulo': titulo,
                                'materias': sorted(list(materias)),
                                'total_questoes': total_questoes,
                                'data_modificacao': data_modificacao,
                                'tamanho': tamanho,
                                'caminho': caminho_completo
                            })
                    except Exception as e:
                        logger.error(f'Erro ao ler arquivo {arquivo}: {str(e)}')
                        simulados.append({
                            'arquivo': arquivo,
                            'titulo': 'Erro ao ler arquivo',
                            'materias': [],
                            'total_questoes': 0,
                            'data_modificacao': data_modificacao,
                            'tamanho': tamanho,
                            'caminho': caminho_completo
                        })
    except Exception as e:
        logger.error(f'Erro ao listar simulados: {str(e)}')
        flash('Erro ao listar simulados', 'error')
    
    # Ordenar por data de modificação (mais recente primeiro)
    simulados.sort(key=lambda x: x['data_modificacao'], reverse=True)
    
    return render_template('simulados/admin.html', simulados=simulados)
