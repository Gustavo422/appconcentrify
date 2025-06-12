const express = require('express');
const { supabase } = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /macetes/admin
 * Painel administrativo de macetes
 */
router.get('/admin', requireAdmin, async (req, res) => {
  console.log('🔐 ACESSANDO ROTA ADMIN');
  try {
    const { data: macetes, error } = await supabase
      .from('macetes')
      .select('*')
      .order('categoria', { ascending: true });

    if (error) {
      throw error;
    }

    const categorias = [...new Set(macetes?.map(m => m.categoria) || [])];
    const niveis = ['Básico', 'Intermediário', 'Especialista'];

    res.render('macetes/admin', {
      title: 'Gerenciar Macetes - Concentrify',
      macetes: macetes || [],
      categorias,
      niveis,
    });
  } catch (error) {
    console.error('Erro ao carregar admin de macetes:', error);
    req.flash('error', 'Erro ao carregar macetes');
    res.redirect('/macetes');
  }
});

/**
 * GET /macetes/admin/new
 * Formulário para criar novo macete
 */
router.get('/admin/new', requireAdmin, (req, res) => {
  const categorias = ['Memorização', 'Produtividade', 'Organização', 'Foco', 'Motivação'];
  const niveis = ['Básico', 'Intermediário', 'Especialista'];

  res.render('macetes/new', {
    title: 'Novo Macete - Concentrify',
    categorias,
    niveis,
    macete: null,
  });
});

/**
 * POST /macetes/admin/new
 * Criar novo macete
 */
router.post('/admin/new', requireAdmin, async (req, res) => {
  try {
    const { titulo, descricao, categoria, nivel, conteudo, exemplos, dicas } = req.body;

    const { data, error } = await supabase
      .from('macetes')
      .insert({
        titulo,
        descricao,
        categoria,
        nivel,
        conteudo,
        exemplos,
        dicas,
        status: 'ativo',
        ordem: 0,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    req.flash('success', 'Macete criado com sucesso!');
    res.redirect('/macetes/admin');
  } catch (error) {
    console.error('Erro ao criar macete:', error);
    req.flash('error', 'Erro ao criar macete');
    res.redirect('/macetes/admin/new');
  }
});

/**
 * GET /macetes/admin/test
 * Rota de teste para verificar se as rotas estão funcionando
 */
router.get('/admin/test', requireAdmin, (req, res) => {
  console.log('🧪 ROTA DE TESTE CHAMADA');
  console.log('👤 Usuário:', req.user ? req.user.email : 'Não autenticado');
  console.log('👑 É admin:', req.user ? req.user.is_admin : false);
  
  res.json({ 
    success: true, 
    message: 'Rota de teste funcionando',
    user: req.user ? {
      id: req.user.id,
      email: req.user.email,
      is_admin: req.user.is_admin
    } : null
  });
});

/**
 * POST /macetes/admin/test
 * Rota de teste POST
 */
router.post('/admin/test', requireAdmin, (req, res) => {
  console.log('🧪 ROTA DE TESTE POST CHAMADA');
  console.log('📦 Body:', req.body);
  
  res.json({ 
    success: true, 
    message: 'Rota POST de teste funcionando',
    receivedData: req.body
  });
});

/**
 * GET /macetes/test-public
 * Rota de teste público (sem autenticação)
 */
router.get('/test-public', (req, res) => {
  console.log('🧪 ROTA PÚBLICA DE TESTE CHAMADA');
  console.log('📋 Headers:', req.headers);
  
  res.json({ 
    success: true, 
    message: 'Rota pública funcionando',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /macetes/test-public
 * Rota de teste POST público
 */
router.post('/test-public', (req, res) => {
  console.log('🧪 ROTA POST PÚBLICA CHAMADA');
  console.log('📦 Body:', req.body);
  console.log('📋 Headers:', req.headers);
  
  res.json({ 
    success: true, 
    message: 'Rota POST pública funcionando',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /macetes
 * Listar macetes
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: macetes, error } = await supabase
      .from('macetes')
      .select('*')
      .eq('status', 'ativo')
      .order('categoria', { ascending: true });

    if (error) {
      throw error;
    }

    // Organizar macetes por categoria
    const categorias = [...new Set(macetes?.map(m => m.categoria) || [])];
    const niveis = ['Básico', 'Intermediário', 'Especialista'];

    res.render('macetes/index', {
      title: '107 Macetes para memorizar - Concentrify',
      macetes: macetes || [],
      categorias,
      niveis,
    });
  } catch (error) {
    console.error('Erro ao listar macetes:', error);
    req.flash('error', 'Erro ao carregar macetes');
    res.render('macetes/index', {
      title: '107 Macetes para memorizar - Concentrify',
      macetes: [],
      categorias: [],
      niveis: [],
    });
  }
});

/**
 * GET /macetes/:id
 * Visualizar detalhes de um macete
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: macete, error } = await supabase
      .from('macetes')
      .select('*')
      .eq('id', id)
      .eq('status', 'ativo')
      .single();

    if (error || !macete) {
      req.flash('error', 'Macete não encontrado');
      return res.redirect('/macetes');
    }

    res.render('macetes/show', {
      title: `${macete.titulo} - Concentrify`,
      macete,
      isAdmin: req.user?.is_admin || false,
    });
  } catch (error) {
    console.error('Erro ao carregar macete:', error);
    req.flash('error', 'Erro ao carregar macete');
    res.redirect('/macetes');
  }
});

/**
 * GET /macetes/:id/edit
 * Formulário para editar macete
 */
router.get('/:id/edit', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: macete, error } = await supabase
      .from('macetes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !macete) {
      req.flash('error', 'Macete não encontrado');
      return res.redirect('/macetes/admin');
    }

    const categorias = ['Memorização', 'Produtividade', 'Organização', 'Foco', 'Motivação'];
    const niveis = ['Básico', 'Intermediário', 'Especialista'];

    res.render('macetes/edit', {
      title: 'Editar Macete - Concentrify',
      macete,
      categorias,
      niveis,
    });
  } catch (error) {
    console.error('Erro ao carregar macete:', error);
    req.flash('error', 'Erro ao carregar macete');
    res.redirect('/macetes/admin');
  }
});

/**
 * PUT /macetes/:id/edit
 * Atualizar macete
 */
router.put('/:id/edit', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, categoria, nivel, conteudo, exemplos, dicas } = req.body;

    const { data, error } = await supabase
      .from('macetes')
      .update({
        titulo,
        descricao,
        categoria,
        nivel,
        conteudo,
        exemplos,
        dicas,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    req.flash('success', 'Macete atualizado com sucesso!');
    res.redirect('/macetes/admin');
  } catch (error) {
    console.error('Erro ao atualizar macete:', error);
    req.flash('error', 'Erro ao atualizar macete');
    res.redirect(`/macetes/${req.params.id}/edit`);
  }
});

/**
 * POST /macetes/:id/toggle-status
 * Alternar status do macete (ativo/inativo)
 */
router.post('/:id/toggle-status', requireAdmin, async (req, res) => {
  console.log('🔄 ROTA TOGGLE CHAMADA');
  console.log('📋 Parâmetros:', req.params);
  console.log('📦 Body:', req.body);
  console.log('🔑 Headers:', req.headers);
  
  try {
    console.log('🔄 Toggle status - ID:', req.params.id, 'Body:', req.body);
    
    const { id } = req.params;
    const { status } = req.body;

    console.log('📝 Atualizando status do macete:', id, 'para:', status === 'ativo' ? 'inativo' : 'ativo');

    const { data, error } = await supabase
      .from('macetes')
      .update({ 
        status: status === 'ativo' ? 'inativo' : 'ativo',
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro no toggle:', error);
      throw error;
    }

    console.log('✅ Status atualizado com sucesso:', data);
    res.json({ success: true, message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao alterar status do macete:', error);
    res.json({ success: false, message: 'Erro ao alterar status: ' + error.message });
  }
});

/**
 * DELETE /macetes/:id
 * Excluir macete
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  console.log('🗑️ ROTA DELETE CHAMADA');
  console.log('📋 Parâmetros:', req.params);
  console.log('🔑 Headers:', req.headers);
  
  try {
    console.log('🗑️ Delete macete - ID:', req.params.id);
    
    const { id } = req.params;

    const { error } = await supabase
      .from('macetes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro no delete:', error);
      throw error;
    }

    console.log('✅ Macete excluído com sucesso');
    res.json({ success: true, message: 'Macete excluído com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir macete:', error);
    res.json({ success: false, message: 'Erro ao excluir macete: ' + error.message });
  }
});

module.exports = router;
