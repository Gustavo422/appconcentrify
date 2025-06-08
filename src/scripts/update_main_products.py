from flask import Flask
from src.models import db
from src.models.product import Product
from src.config import get_config

def update_main_products():
    app = Flask(__name__)
    app.config.from_object(get_config())
    
    with app.app_context():
        db.init_app(app)
        
        # Lista dos produtos que devem ser principais
        main_products = [
            'O Fim Das 6 Malditas',
            'Método Memória de Elefante',
            '100 Questões Semanais',
            '30 simulados personalizados'
        ]
        
        # Primeiro, definir todos os produtos como não principais
        Product.query.update({Product.is_main: False})
        
        # Depois, definir apenas os produtos especificados como principais
        for title in main_products:
            product = Product.query.filter_by(title=title).first()
            if product:
                product.is_main = True
                print(f"Produto '{title}' definido como principal")
            else:
                print(f"Produto '{title}' não encontrado")
        
        # Commit das alterações
        db.session.commit()
        
        # Verificar resultado
        print("\nProdutos principais após atualização:")
        print("-" * 50)
        main_products = Product.query.filter_by(is_main=True).all()
        for product in main_products:
            print(f"Título: {product.title}")
            print(f"Tipo: {product.content_type}")
            print(f"Ordem: {product.order}")
            print("-" * 50)

if __name__ == '__main__':
    update_main_products() 