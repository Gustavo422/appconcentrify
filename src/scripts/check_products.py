from app import create_app, db
from models.product import Product

def check_products():
    try:
        app = create_app()
        with app.app_context():
            # Buscar todos os produtos
            products = Product.query.all()
            
            print("\nTodos os produtos no banco de dados:")
            print("-" * 50)
            
            for product in products:
                print(f"\nID: {product.id}")
                print(f"Título: {product.title}")
                print(f"Descrição: {product.description}")
                print(f"É principal: {product.is_main}")
                print(f"Tipo de conteúdo: {product.content_type}")
                print(f"Ordem: {product.order}")
                print(f"Imagem: {product.cover_image}")
                print(f"Arquivo: {product.pdf_file}")
                print("-" * 50)
            
            # Buscar especificamente produtos com título similar
            similar_products = Product.query.filter(
                Product.title.like('%Questões Semanais%')
            ).all()
            
            print("\nProdutos com título similar a 'Questões Semanais':")
            print("-" * 50)
            
            for product in similar_products:
                print(f"\nID: {product.id}")
                print(f"Título: {product.title}")
                print(f"Descrição: {product.description}")
                print(f"É principal: {product.is_main}")
                print(f"Tipo de conteúdo: {product.content_type}")
                print(f"Ordem: {product.order}")
                print(f"Imagem: {product.cover_image}")
                print(f"Arquivo: {product.pdf_file}")
                print("-" * 50)
    except Exception as e:
        import traceback
        print("Erro ao executar o script:")
        traceback.print_exc()

if __name__ == '__main__':
    check_products() 