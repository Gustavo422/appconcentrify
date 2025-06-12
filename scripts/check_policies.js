const { supabase } = require('../config/database');

async function checkPolicies() {
  try {
    console.log('🔍 Verificando políticas RLS da tabela macetes...\n');

    // Verificar se a tabela existe
    console.log('1️⃣ Verificando se a tabela macetes existe...');
    const { data: tableExists, error: tableError } = await supabase
      .from('macetes')
      .select('count')
      .limit(1);

    if (tableError) {
      console.log('❌ Erro ao acessar tabela:', tableError.message);
      return;
    }
    console.log('✅ Tabela macetes existe');

    // Tentar inserir um macete de teste
    console.log('\n2️⃣ Testando inserção...');
    const testMacete = {
      titulo: 'Teste Política',
      descricao: 'Teste',
      categoria: 'Teste',
      nivel: 'Básico',
      conteudo: 'Teste',
      status: 'ativo',
      ordem: 999
    };

    const { data: inserted, error: insertError } = await supabase
      .from('macetes')
      .insert(testMacete)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Erro na inserção:', insertError.message);
      console.log('💡 Possível problema com políticas RLS');
    } else {
      console.log('✅ Inserção funcionou - ID:', inserted.id);
      
      // Testar atualização
      console.log('\n3️⃣ Testando atualização...');
      const { data: updated, error: updateError } = await supabase
        .from('macetes')
        .update({ titulo: 'Teste Atualizado' })
        .eq('id', inserted.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ Erro na atualização:', updateError.message);
      } else {
        console.log('✅ Atualização funcionou');
      }

      // Testar exclusão
      console.log('\n4️⃣ Testando exclusão...');
      const { error: deleteError } = await supabase
        .from('macetes')
        .delete()
        .eq('id', inserted.id);

      if (deleteError) {
        console.log('❌ Erro na exclusão:', deleteError.message);
      } else {
        console.log('✅ Exclusão funcionou');
      }
    }

    // Verificar dados existentes
    console.log('\n5️⃣ Verificando dados existentes...');
    const { data: existingMacetes, error: selectError } = await supabase
      .from('macetes')
      .select('*')
      .limit(5);

    if (selectError) {
      console.log('❌ Erro na consulta:', selectError.message);
    } else {
      console.log(`✅ Consulta funcionou - ${existingMacetes?.length || 0} macetes encontrados`);
      if (existingMacetes && existingMacetes.length > 0) {
        console.log('📋 Primeiro macete:', {
          id: existingMacetes[0].id,
          titulo: existingMacetes[0].titulo,
          status: existingMacetes[0].status
        });
      }
    }

    console.log('\n🎉 Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkPolicies(); 