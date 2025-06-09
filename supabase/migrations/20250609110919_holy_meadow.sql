-- Migração: Criar tabela de produtos
-- Data: 2024-01-01
-- Descrição: Cria a tabela de produtos educacionais

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cover_image VARCHAR(255),
    pdf_file VARCHAR(255),
    content_type VARCHAR(50) DEFAULT 'pdf',
    is_main BOOLEAN DEFAULT TRUE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_products_content_type ON products(content_type);
CREATE INDEX IF NOT EXISTS idx_products_is_main ON products(is_main);
CREATE INDEX IF NOT EXISTS idx_products_order ON products("order");
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados vejam produtos
CREATE POLICY "Authenticated users can view products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir que admins gerenciem produtos
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();