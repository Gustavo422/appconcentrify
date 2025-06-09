const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

// Criar cliente Supabase
const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

// Cliente com privilégios de service role para operações administrativas
const supabaseAdmin = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Função para testar conexão
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    return false;
  }
}

module.exports = {
  supabase,
  supabaseAdmin,
  testConnection
};