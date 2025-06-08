from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importar modelos após definir db
from src.models.user import User
from src.models.product import Product
from src.models.simulado import Simulado, Questao, RespostaSimulado
from src.models.questoes_semanais import QuestoesSemanais, QuestaoSemanal, RespostaQuestaoSemanal
