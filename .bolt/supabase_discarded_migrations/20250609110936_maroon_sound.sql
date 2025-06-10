-- Migração: Criar tabela de macetes
-- Data: 2024-01-01
-- Descrição: Cria a tabela para armazenar macetes de memorização

-- Criar tabela de macetes
CREATE TABLE IF NOT EXISTS macetes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR(100) NOT NULL,
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('Básico', 'Intermediário', 'Especialista')),
    titulo VARCHAR(200) NOT NULL,
    abreviacao VARCHAR(100) NOT NULL,
    explicacao TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_macetes_categoria ON macetes(categoria);
CREATE INDEX IF NOT EXISTS idx_macetes_nivel ON macetes(nivel);
CREATE INDEX IF NOT EXISTS idx_macetes_created_at ON macetes(created_at);

-- Habilitar RLS
ALTER TABLE macetes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam macetes
CREATE POLICY "Authenticated users can view macetes" ON macetes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir que admins gerenciem macetes
CREATE POLICY "Admins can manage macetes" ON macetes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_macetes_updated_at 
    BEFORE UPDATE ON macetes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();