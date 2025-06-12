const { supabase } = require('../../config/database');

async function seedProducts() {
  try {
    console.log('🌱 Iniciando seed de produtos...');

    const products = [
      {
        title: 'Método Memória de Elefante',
        description: 'Método simples para decorar qualquer matéria ou conceito com facilidade',
        content_type: 'pdf',
        is_main: true,
        order: 1
      },
      {
        title: '107 Macetes para memorizar',
        description: '107 truques e abreviações para memorizar rapidamente conteúdos de Biologia, História, Geografia, Português, Exatas, etc.',
        content_type: 'macetes',
        is_main: false,
        order: 1
      },
      {
        title: '30 simulados personalizados',
        description: 'Escolha entre 30 simulados para você responder com base no concurso que você quer prestar.',
        content_type: 'simulados',
        is_main: true,
        order: 2
      },
      {
        title: '100 Questões Semanais',
        description: 'Pratique com questões semanais organizadas por matéria e nível de dificuldade.',
        content_type: 'questoes_semanais',
        is_main: false,
        order: 2
      }
    ];

    for (const product of products) {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

      if (error) {
        console.error(`❌ Erro ao inserir produto "${product.title}":`, error);
      } else {
        console.log(`✅ Produto "${product.title}" inserido com sucesso!`);
      }
    }

    console.log('🎉 Seed de produtos concluído!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts }; 