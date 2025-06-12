#!/usr/bin/env node

/**
 * Script de configuração inicial do projeto
 * Cria as tabelas no Supabase e dados iniciais
 */

const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');

const createTables = async function() {
  console.log('🔧 Criando tabelas no Supabase...');

  try {
    // Criar tabela de usuários
    const { error: usersError } = await supabaseAdmin.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela users:', usersError);
    } else {
      console.log('✅ Tabela users criada/verificada');
    }

    // Criar tabela de produtos
    const { error: productsError } = await supabaseAdmin.rpc(
      'create_products_table',
    );
    if (productsError && !productsError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela products:', productsError);
    } else {
      console.log('✅ Tabela products criada/verificada');
    }

    // Criar tabela de simulados
    const { error: simuladosError } = await supabaseAdmin.rpc(
      'create_simulados_table',
    );
    if (simuladosError && !simuladosError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela simulados:', simuladosError);
    } else {
      console.log('✅ Tabela simulados criada/verificada');
    }

    // Criar tabela de macetes
    const { error: macetesError } = await supabaseAdmin.rpc(
      'create_macetes_table',
    );
    if (macetesError && !macetesError.message.includes('already exists')) {
      console.error('❌ Erro ao criar tabela macetes:', macetesError);
    } else {
      console.log('✅ Tabela macetes criada/verificada');
    }

    // Criar tabela de questões semanais
    const { error: questoesError } = await supabaseAdmin.rpc(
      'create_questoes_semanais_table',
    );
    if (questoesError && !questoesError.message.includes('already exists')) {
      console.error(
        '❌ Erro ao criar tabela questoes_semanais:',
        questoesError,
      );
    } else {
      console.log('✅ Tabela questoes_semanais criada/verificada');
    }
  } catch (error) {
    console.error('❌ Erro geral ao criar tabelas:', error);
  }
};

const createAdminUser = async function() {
  console.log('👤 Criando usuário administrador...');

  try {
    // Verificar se já existe um admin
    const { data: existingAdmin } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'admin@concentrify.com')
      .single();

    if (existingAdmin) {
      console.log('✅ Usuário admin já existe');
      return;
    }

    // Criar senha hash
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar usuário admin
    const { error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email: 'admin@concentrify.com',
          name: 'Administrador',
          password_hash: passwordHash,
          is_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar admin:', error);
      return;
    }

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email: admin@concentrify.com');
    console.log('🔑 Senha: admin123');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
};

const createInitialProducts = async function() {
  console.log('📦 Criando produtos iniciais...');

  const products = [
    {
      title: 'O Fim Das 6 Malditas',
      description: 'A capa está no seguinte link aonde voce pode baixar',
      cover_image: 'fim_das_6_malditas.png',
      pdf_file: 'fim_das_6_malditas.pdf',
      is_main: true,
      content_type: 'pdf',
      order: 1,
    },
    {
      title: 'Método Memória de Elefante',
      description:
        'Método simples para decorar qualquer matéria com ou conceito com facilidade',
      cover_image: 'memoria_elefante.png',
      pdf_file: 'memoria_elefante.pdf',
      is_main: true,
      content_type: 'pdf',
      order: 2,
    },
    {
      title: '30 simulados personalizados',
      description:
        'Escolha entre 30 simulados pra voce responder com base no concurso que voce quer prestar.',
      cover_image: 'simulados.png',
      pdf_file: 'simulados.json',
      is_main: true,
      content_type: 'simulados',
      order: 3,
    },
    {
      title: '107 Macetes para memorizar',
      description:
        '107 truques e abreviações para memorizar rapidamente conteúdos de Biologia, História, Geografia, Português, Exatas, etc.',
      cover_image: 'macetes.png',
      pdf_file: 'macetes.json',
      is_main: false,
      content_type: 'macetes',
      order: 1,
    },
    {
      title: '100 Questões Semanais',
      description:
        'Pratique com questões semanais organizadas por matéria e nível de dificuldade.',
      cover_image: 'cem_questoes_semanais.png',
      pdf_file: 'questoes_semanais.json',
      is_main: false,
      content_type: 'questoes_semanais',
      order: 2,
    },
  ];

  try {
    for (const product of products) {
      // Verificar se o produto já existe
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('title', product.title)
        .single();

      if (existing) {
        console.log(`✅ Produto "${product.title}" já existe`);
        continue;
      }

      // Criar produto
      const { error } = await supabaseAdmin.from('products').insert([
        {
          ...product,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error(`❌ Erro ao criar produto "${product.title}":`, error);
      } else {
        console.log(`✅ Produto "${product.title}" criado`);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao criar produtos:', error);
  }
};

const main = async function() {
  console.log('🚀 Iniciando configuração do Concentrify...\n');

  await createTables();
  console.log('');

  await createAdminUser();
  console.log('');

  await createInitialProducts();
  console.log('');

  console.log('✅ Configuração concluída com sucesso!');
  console.log('🎯 Você pode agora executar: npm start');

  process.exit(0);
};

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro na configuração:', error);
    process.exit(1);
  });
}

module.exports = { main };
