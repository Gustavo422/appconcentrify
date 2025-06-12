const express = require('express');
const { supabase } = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /questoes-semanais
 * Listar questões semanais
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: questoesSemanais, error } = await supabase
      .from('questoes_semanais')
      .select('*')
      .eq('status', 'ativo')
      .order('semana_referencia', { ascending: false });

    if (error) {
      throw error;
    }

    res.render('questoes-semanais/index', {
      title: 'Questões Semanais - Concentrify',
      questoesSemanais: questoesSemanais || [],
    });
  } catch (error) {
    console.error('Erro ao listar questões semanais:', error);
    req.flash('error', 'Erro ao carregar questões semanais');
    res.render('questoes-semanais/index', {
      title: 'Questões Semanais - Concentrify',
      questoesSemanais: [],
    });
  }
});

/**
 * GET /questoes-semanais/admin
 * Painel administrativo de questões semanais
 */
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const { data: questoesSemanais, error } = await supabase
      .from('questoes_semanais')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.render('questoes-semanais/admin', {
      title: 'Gerenciar Questões Semanais - Concentrify',
      questoesSemanais: questoesSemanais || [],
    });
  } catch (error) {
    console.error('Erro ao carregar admin de questões semanais:', error);
    req.flash('error', 'Erro ao carregar questões semanais');
    res.redirect('/admin/dashboard');
  }
});

module.exports = router;
