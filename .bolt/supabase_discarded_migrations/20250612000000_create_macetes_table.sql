-- Migração: Criar tabela de macetes
-- Data: 2025-06-12
-- Descrição: Cria a tabela de macetes para dicas e truques de estudo

-- Criar tabela de macetes
CREATE TABLE IF NOT EXISTS macetes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100) NOT NULL,
    nivel VARCHAR(50) NOT NULL DEFAULT 'Básico',
    conteudo TEXT NOT NULL,
    exemplos TEXT,
    dicas TEXT,
    status VARCHAR(20) DEFAULT 'ativo',
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_macetes_categoria ON macetes(categoria);
CREATE INDEX IF NOT EXISTS idx_macetes_nivel ON macetes(nivel);
CREATE INDEX IF NOT EXISTS idx_macetes_status ON macetes(status);
CREATE INDEX IF NOT EXISTS idx_macetes_ordem ON macetes(ordem);
CREATE INDEX IF NOT EXISTS idx_macetes_created_at ON macetes(created_at);

-- Habilitar RLS
ALTER TABLE macetes ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados vejam macetes ativos
CREATE POLICY "Authenticated users can view active macetes" ON macetes
    FOR SELECT USING (
        auth.role() = 'authenticated' AND status = 'ativo'
    );

-- Política para permitir que admins vejam todos os macetes
CREATE POLICY "Admins can view all macetes" ON macetes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

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

-- Inserir alguns macetes de exemplo
INSERT INTO macetes (titulo, descricao, categoria, nivel, conteudo, exemplos, dicas, status, ordem) VALUES
(
    'Regra dos 3 Passos',
    'Técnica para memorização rápida',
    'Memorização',
    'Básico',
    'Para memorizar qualquer informação, divida em 3 etapas: 1) Compreensão, 2) Associação, 3) Repetição.',
    'Para memorizar uma fórmula: 1) Entenda o que cada parte significa, 2) Associe com algo familiar, 3) Repita 3 vezes.',
    'Use sempre 3 repetições para fixar melhor na memória.',
    'ativo',
    1
),
(
    'Técnica Pomodoro',
    'Método de estudo com intervalos',
    'Produtividade',
    'Básico',
    'Estude por 25 minutos focados, depois faça uma pausa de 5 minutos. A cada 4 ciclos, faça uma pausa maior de 15-30 minutos.',
    '25min estudo → 5min pausa → 25min estudo → 5min pausa → 25min estudo → 5min pausa → 25min estudo → 15min pausa.',
    'Use um timer para manter o foco e não interromper o ciclo.',
    'ativo',
    2
),
(
    'Mapa Mental',
    'Organização visual de informações',
    'Organização',
    'Intermediário',
    'Crie um diagrama central com o tema principal e ramifique com subtópicos, usando cores e imagens.',
    'Tema: "Sistema Solar" → Sol (centro) → Planetas (ramos) → Características (sub-ramos).',
    'Use cores diferentes para cada ramo e desenhe pequenos ícones.',
    'ativo',
    3
); 