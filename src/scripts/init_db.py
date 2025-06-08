from datetime import datetime
from src.app import create_app, db
from src.models.user import User
from src.models.product import Product
from src.config import get_config

def init_db():
    app = create_app()
    app.config.from_object(get_config())
    
    with app.app_context():
        # Criar todas as tabelas
        db.create_all()
        
        # Criar usuário admin se não existir
        if not User.query.filter_by(email='admin@concentrify.com').first():
            admin = User(
                email='admin@concentrify.com',
                is_admin=True,
                created_at=datetime.now()
            )
            db.session.add(admin)
            db.session.commit()
            print("Usuário admin criado com sucesso!")
        
        # Criar produtos iniciais
        initial_products = [
            {
                'title': 'O Fim Das 6 Malditas',
                'description': 'A capa está no seguinte link aonde voce pode baixar',
                'cover_image': 'fim_das_6_malditas.png',
                'pdf_file': 'fim_das_6_malditas.pdf',
                'is_main': True,
                'content_type': 'pdf',
                'order': 1
            },
            {
                'title': 'Método Memória de Elefante',
                'description': 'Método simples para decorar qualquer matéria com ou conceito com facilidade',
                'cover_image': 'memoria_elefante.png',
                'pdf_file': 'memoria_elefante.pdf',
                'is_main': True,
                'content_type': 'pdf',
                'order': 2
            },
            {
                'title': '107 Macetes para memorizar',
                'description': '107 truques e abreviações para memorizar rapidamente conteúdos de Biologia, História, Geografia, Português, Exatas, etc.',
                'cover_image': 'macetes.png',
                'pdf_file': 'macetes.json',
                'is_main': False,
                'content_type': 'macetes',
                'order': 1
            },
            {
                'title': '30 simulados personalizados',
                'description': 'Escolha entre 30 simulados pra voce responder com base no concurso que voce quer prestar.',
                'cover_image': 'simulados.png',
                'pdf_file': 'simulados.json',
                'is_main': True,
                'content_type': 'simulados',
                'order': 3
            },
            {
                'title': '100 Questões Semanais',
                'description': 'Pratique com questões semanais organizadas por matéria e nível de dificuldade.',
                'cover_image': 'cem_questoes_semanais.png',
                'pdf_file': 'questoes_semanais.json',
                'is_main': False,
                'content_type': 'questoes_semanais',
                'order': 2
            }
        ]
        
        for product_data in initial_products:
            if not Product.query.filter_by(title=product_data['title']).first():
                product = Product(**product_data)
                db.session.add(product)
                print(f"Produto '{product_data['title']}' criado com sucesso!")
        
        db.session.commit()
        print("Inicialização do banco de dados concluída!")

if __name__ == '__main__':
    init_db() 