-- Migração: Criar tabelas de simulados
-- Data: 2024-01-01
-- Descrição: Cria as tabelas para simulados e questões

-- Criar tabela de simulados
CREATE TABLE IF NOT EXISTS simulados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
    arquivo_json VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ativo',
    total_questoes INTEGER DEFAULT 0,
    materias TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de questões
CREATE TABLE IF NOT EXISTS questoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulado_id UUID REFERENCES simulados(id) ON DELETE CASCADE,
    materia VARCHAR(100) NOT NULL,
    enunciado TEXT NOT NULL,
    alternativa_a TEXT NOT NULL,
    alternativa_b TEXT NOT NULL,
    alternativa_c TEXT NOT NULL,
    alternativa_d TEXT NOT NULL,
    alternativa_e TEXT NOT NULL,
    resposta_correta CHAR(1) NOT NULL CHECK (resposta_correta IN ('A', 'B', 'C', 'D', 'E')),
    numero_questao INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de respostas dos simulados
CREATE TABLE IF NOT EXISTS respostas_simulados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    simulado_id UUID REFERENCES simulados(id) ON DELETE CASCADE,
    questao_id UUID REFERENCES questoes(id) ON DELETE CASCADE,
    resposta CHAR(1) NOT NULL CHECK (resposta IN ('A', 'B', 'C', 'D', 'E')),
    data_resposta TIMESTAMPTZ DEFAULT NOW(),
    acertou BOOLEAN NOT NULL,
    tempo_gasto INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_simulados_status ON simulados(status);
CREATE INDEX IF NOT EXISTS idx_simulados_created_at ON simulados(created_at);
CREATE INDEX IF NOT EXISTS idx_questoes_simulado_id ON questoes(simulado_id);
CREATE INDEX IF NOT EXISTS idx_questoes_materia ON questoes(materia);
CREATE INDEX IF NOT EXISTS idx_respostas_user_id ON respostas_simulados(user_id);
CREATE INDEX IF NOT EXISTS idx_respostas_simulado_id ON respostas_simulados(simulado_id);

-- Habilitar RLS
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_simulados ENABLE ROW LEVEL SECURITY;

-- Políticas para simulados
CREATE POLICY "Users can view active simulados" ON simulados
    FOR SELECT USING (status = 'ativo' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage simulados" ON simulados
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Políticas para questões
CREATE POLICY "Users can view questoes from active simulados" ON questoes
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM simulados 
            WHERE id = questoes.simulado_id AND status = 'ativo'
        )
    );

CREATE POLICY "Admins can manage questoes" ON questoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Políticas para respostas
CREATE POLICY "Users can view own respostas" ON respostas_simulados
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own respostas" ON respostas_simulados
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all respostas" ON respostas_simulados
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Triggers para atualizar updated_at
CREATE TRIGGER update_simulados_updated_at 
    BEFORE UPDATE ON simulados 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questoes_updated_at 
    BEFORE UPDATE ON questoes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();