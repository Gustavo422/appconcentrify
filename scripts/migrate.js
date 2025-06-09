#!/usr/bin/env node

/**
 * Script de migração do banco de dados
 * Executa as migrações SQL necessárias
 */

const { supabaseAdmin } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function runMigrations() {
  console.log('🔄 Executando migrações...');

  try {
    // Criar tabela de migrações se não existir
    await supabaseAdmin.rpc('create_migrations_table');

    // Ler arquivos de migração
    const migrationFiles = await fs.readdir(MIGRATIONS_DIR);
    const sqlFiles = migrationFiles
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of sqlFiles) {
      const migrationName = path.basename(file, '.sql');
      
      // Verificar se a migração já foi executada
      const { data: executed } = await supabaseAdmin
        .from('migrations')
        .select('id')
        .eq('name', migrationName)
        .single();

      if (executed) {
        console.log(`⏭️  Migração ${migrationName} já executada`);
        continue;
      }

      // Ler e executar migração
      const migrationPath = path.join(MIGRATIONS_DIR, file);
      const sql = await fs.readFile(migrationPath, 'utf8');

      console.log(`🔄 Executando migração: ${migrationName}`);
      
      const { error } = await supabaseAdmin.rpc('execute_sql', { sql_query: sql });
      
      if (error) {
        console.error(`❌ Erro na migração ${migrationName}:`, error);
        continue;
      }

      // Registrar migração como executada
      await supabaseAdmin
        .from('migrations')
        .insert([{
          name: migrationName,
          executed_at: new Date().toISOString()
        }]);

      console.log(`✅ Migração ${migrationName} executada com sucesso`);
    }

    console.log('✅ Todas as migrações foram executadas!');
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  runMigrations().catch(error => {
    console.error('❌ Erro nas migrações:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations };