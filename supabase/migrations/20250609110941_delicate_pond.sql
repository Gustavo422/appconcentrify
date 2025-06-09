-- Migração: Criar tabelas de questões semanais
-- Data: 2024-01-01
-- Descrição: Cria as tabelas para questões semanais

-- Criar tabela de questões semanais
CREATE TABLE IF NOT EXISTS questoes_semanais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
    arquivo_json VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ativo',
    total_questoes INTEGER DEFAULT 0,
    materias TEXT,
    semana_referencia DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de questões semanais individuais
CREATE TABLE IF NOT EXISTS questoes_semanais_questoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questoes_semanais_id UUID REFERENCES questoes_semanais(id) ON DELETE CASCADE,
    materia VARCHAR(100) NOT NULL,
    enunciado TEXT NOT NULL,
    alternativa_a TEXT NOT NULL,
    alternativa_b TEXT NOT NULL,
    alternativa_c TEXT NOT NULL,
    alternativa_d TEXT NOT NULL,
    alternativa_e TEXT NOT NULL,
    resposta_correta CHAR(1) NOT NULL CHECK (resposta_correta IN ('A', 'B', 'C', 'D', 'E')),
    numero_questao INTEGER NOT NULL,
    nivel_dificuldade VARCHAR(20) DEFAULT 'médio',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de respostas das questões semanais
CREATE TABLE IF NOT EXISTS respostas_questoes_semanais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    questoes_semanais_id UUID REFERENCES questoes_semanais(id) ON DELETE CASCADE,
    questao_id UUID REFERENCES questoes_semanais_questoes(id) ON DELETE CASCADE,
    resposta CHAR(1) NOT NULL CHECK (resposta IN ('A', 'B', 'C', 'D', 'E')),
    data_resposta TIMESTAMPTZ DEFAULT NOW(),
    acertou BOOLEAN NOT NULL,
    tempo_gasto INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_questoes_semanais_status ON questoes_semanais(status);
CREATE INDEX IF NOT EXISTS idx_questoes_semanais_semana ON questoes_semanais(semana_referencia);
CREATE INDEX IF NOT EXISTS idx_questoes_semanais_questoes_id ON questoes_semanais_questoes(questoes_semanais_id);
CREATE INDEX IF NOT EXISTS idx_respostas_questoes_semanais_user ON respostas_questoes_semanais(user_id);

-- Habilitar RLS
ALTER TABLE questoes_semanais ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes_semanais_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_questoes_semanais ENABLE ROW LEVEL SECURITY;

-- Políticas para questões semanais
CREATE POLICY "Users can view active questoes semanais" ON questoes_semanais
    FOR SELECT USING (status = 'ativo' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage questoes semanais" ON questoes_semanais
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Políticas para questões individuais
CREATE POLICY "Users can view questoes from active questoes semanais" ON questoes_semanais_questoes
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM questoes_semanais 
            WHERE id = questoes_semanais_questoes.questoes_semanais_id AND status = 'ativo'
        )
    );

CREATE POLICY "Admins can manage questoes semanais questoes" ON questoes_semanais_questoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Políticas para respostas
CREATE POLICY "Users can view own respostas questoes semanais" ON respostas_questoes_semanais
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own respostas questoes semanais" ON respostas_questoes_semanais
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all respostas questoes semanais" ON respostas_questoes_semanais
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Triggers para atualizar updated_at
CREATE TRIGGER update_questoes_semanais_updated_at 
    BEFORE UPDATE ON questoes_semanais 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questoes_semanais_questoes_updated_at 
    BEFORE UPDATE ON questoes_semanais_questoes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();