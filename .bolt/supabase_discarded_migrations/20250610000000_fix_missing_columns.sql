-- Migração: Corrigir colunas faltantes
-- Data: 2025-06-10
-- Descrição: Adiciona colunas faltantes nas tabelas users e products

-- Adicionar colunas faltantes na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Criar índices para users se não existirem
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Adicionar colunas faltantes na tabela products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cover_image VARCHAR(255),
ADD COLUMN IF NOT EXISTS pdf_file VARCHAR(255),
ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'pdf',
ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Criar índices para products se não existirem
CREATE INDEX IF NOT EXISTS idx_products_content_type ON products(content_type);
CREATE INDEX IF NOT EXISTS idx_products_is_main ON products(is_main);
CREATE INDEX IF NOT EXISTS idx_products_order ON products("order");
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Habilitar RLS se não estiver habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Criar políticas para users se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON users
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can view all users') THEN
        CREATE POLICY "Admins can view all users" ON users
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.uid() AND is_admin = true
                )
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can manage users') THEN
        CREATE POLICY "Admins can manage users" ON users
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.uid() AND is_admin = true
                )
            );
    END IF;
END $$;

-- Criar políticas para products se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Authenticated users can view products') THEN
        CREATE POLICY "Authenticated users can view products" ON products
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins can manage products') THEN
        CREATE POLICY "Admins can manage products" ON products
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = auth.uid() AND is_admin = true
                )
            );
    END IF;
END $$;

-- Criar função update_updated_at_column se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at 
            BEFORE UPDATE ON products 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 