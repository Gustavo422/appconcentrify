const express = require('express');
const { supabase } = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /macetes
 * Listar macetes
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: macetes, error } = await supabase
      .from('macetes')
      .select('*')
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
      niveis
    });
  } catch (error) {
    console.error('Erro ao listar macetes:', error);
    req.flash('error', 'Erro ao carregar macetes');
    res.render('macetes/index', {
      title: '107 Macetes para memorizar - Concentrify',
      macetes: [],
      categorias: [],
      niveis: []
    });
  }
});

/**
 * GET /macetes/admin
 * Painel administrativo de macetes
 */
router.get('/admin', requireAdmin, async (req, res) => {
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
      niveis
    });
  } catch (error) {
    console.error('Erro ao carregar admin de macetes:', error);
    req.flash('error', 'Erro ao carregar macetes');
    res.redirect('/admin/dashboard');
  }
});

module.exports = router;