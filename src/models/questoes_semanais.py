from src.models import db
from datetime import datetime

class QuestoesSemanais(db.Model):
    __tablename__ = 'questoes_semanais'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    arquivo_json = db.Column(db.String(255))  # Caminho do arquivo JSON
    status = db.Column(db.String(20), default='ativo')  # ativo, inativo, rascunho
    total_questoes = db.Column(db.Integer, default=0)
    materias = db.Column(db.String(500))  # Lista de matérias separadas por vírgula
    semana_referencia = db.Column(db.Date, nullable=False)  # Data de referência da semana
    
    # Relacionamentos
    questoes = db.relationship('QuestaoSemanal', backref='questoes_semanais', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, titulo, descricao=None, arquivo_json=None, semana_referencia=None):
        self.titulo = titulo
        self.descricao = descricao
        self.arquivo_json = arquivo_json
        self.status = 'rascunho'
        self.total_questoes = 0
        self.materias = ''
        self.semana_referencia = semana_referencia or datetime.utcnow().date()
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'data_criacao': self.data_criacao.isoformat(),
            'data_atualizacao': self.data_atualizacao.isoformat(),
            'status': self.status,
            'total_questoes': self.total_questoes,
            'materias': self.materias.split(',') if self.materias else [],
            'semana_referencia': self.semana_referencia.isoformat()
        }

class QuestaoSemanal(db.Model):
    __tablename__ = 'questoes_semanais_questoes'
    
    id = db.Column(db.Integer, primary_key=True)
    questoes_semanais_id = db.Column(db.Integer, db.ForeignKey('questoes_semanais.id'), nullable=False)
    materia = db.Column(db.String(100), nullable=False)
    enunciado = db.Column(db.Text, nullable=False)
    alternativa_a = db.Column(db.Text, nullable=False)
    alternativa_b = db.Column(db.Text, nullable=False)
    alternativa_c = db.Column(db.Text, nullable=False)
    alternativa_d = db.Column(db.Text, nullable=False)
    alternativa_e = db.Column(db.Text, nullable=False)
    resposta_correta = db.Column(db.String(1), nullable=False)  # A, B, C, D ou E
    numero_questao = db.Column(db.Integer, nullable=False)
    nivel_dificuldade = db.Column(db.String(20), nullable=False)  # fácil, médio, difícil
    
    def __init__(self, questoes_semanais_id, materia, enunciado, alternativa_a, alternativa_b, 
                 alternativa_c, alternativa_d, alternativa_e, resposta_correta, numero_questao,
                 nivel_dificuldade='médio'):
        self.questoes_semanais_id = questoes_semanais_id
        self.materia = materia
        self.enunciado = enunciado
        self.alternativa_a = alternativa_a
        self.alternativa_b = alternativa_b
        self.alternativa_c = alternativa_c
        self.alternativa_d = alternativa_d
        self.alternativa_e = alternativa_e
        self.resposta_correta = resposta_correta
        self.numero_questao = numero_questao
        self.nivel_dificuldade = nivel_dificuldade
    
    def to_dict(self):
        return {
            'id': self.id,
            'materia': self.materia,
            'enunciado': self.enunciado,
            'alternativas': {
                'A': self.alternativa_a,
                'B': self.alternativa_b,
                'C': self.alternativa_c,
                'D': self.alternativa_d,
                'E': self.alternativa_e
            },
            'correta': self.resposta_correta,
            'numero': self.numero_questao,
            'nivel_dificuldade': self.nivel_dificuldade
        }

class RespostaQuestaoSemanal(db.Model):
    __tablename__ = 'respostas_questoes_semanais'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    questoes_semanais_id = db.Column(db.Integer, db.ForeignKey('questoes_semanais.id'), nullable=False)
    questao_id = db.Column(db.Integer, db.ForeignKey('questoes_semanais_questoes.id'), nullable=False)
    resposta = db.Column(db.String(1), nullable=False)  # A, B, C, D ou E
    data_resposta = db.Column(db.DateTime, default=datetime.utcnow)
    acertou = db.Column(db.Boolean, nullable=False)
    tempo_gasto = db.Column(db.Integer, nullable=True)  # Tempo em segundos
    
    # Relacionamentos
    user = db.relationship('User', backref='respostas_questoes_semanais')
    questoes_semanais = db.relationship('QuestoesSemanais', backref='respostas')
    questao = db.relationship('QuestaoSemanal', backref='respostas')
    
    def __init__(self, user_id, questoes_semanais_id, questao_id, resposta, acertou, tempo_gasto=None):
        self.user_id = user_id
        self.questoes_semanais_id = questoes_semanais_id
        self.questao_id = questao_id
        self.resposta = resposta
        self.acertou = acertou
        self.tempo_gasto = tempo_gasto 