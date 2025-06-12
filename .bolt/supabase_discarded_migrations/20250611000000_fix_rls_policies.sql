-- Migração: Corrigir políticas RLS
-- Data: 2025-06-11
-- Descrição: Corrige as políticas RLS que estão causando recursão infinita

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Criar políticas mais simples que não causam recursão
-- Permitir acesso total para service role (usado pelo backend)
CREATE POLICY "Service role can access all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Permitir que usuários autenticados vejam apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Permitir inserção de novos usuários (para registro)
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- Permitir que usuários atualizem seus próprios dados
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Remover políticas problemáticas da tabela products
DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Criar políticas mais simples para products
CREATE POLICY "Service role can access all products" ON products
    FOR ALL USING (auth.role() = 'service_role');

-- Permitir que usuários autenticados vejam produtos
CREATE POLICY "Authenticated users can view products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que admins gerenciem produtos (usando service role)
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (auth.role() = 'service_role'); 