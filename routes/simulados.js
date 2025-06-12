const express = require('express');
const { supabase } = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /simulados
 * Listar simulados disponíveis
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: simulados, error } = await supabase
      .from('simulados')
      .select('*')
      .eq('status', 'ativo')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.render('simulados/index', {
      title: 'Simulados - Concentrify',
      simulados: simulados || [],
    });
  } catch (error) {
    console.error('Erro ao listar simulados:', error);
    req.flash('error', 'Erro ao carregar simulados');
    res.render('simulados/index', {
      title: 'Simulados - Concentrify',
      simulados: [],
    });
  }
});

/**
 * GET /simulados/admin
 * Painel administrativo de simulados
 */
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data: simulados, error } = await supabase
      .from('simulados')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Contar total de simulados
    const { count: totalSimulados } = await supabase
      .from('simulados')
      .select('id', { count: 'exact' });

    const totalPages = Math.ceil(totalSimulados / limit);

    res.render('simulados/admin', {
      title: 'Gerenciar Simulados - Concentrify',
      simulados: simulados || [],
      pagination: {
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Erro ao carregar admin de simulados:', error);
    req.flash('error', 'Erro ao carregar simulados');
    res.redirect('/admin/dashboard');
  }
});

/**
 * GET /simulados/:id
 * Visualizar simulado específico
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: simulado, error } = await supabase
      .from('simulados')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !simulado) {
      req.flash('error', 'Simulado não encontrado');
      return res.redirect('/simulados');
    }

    res.render('simulados/view', {
      title: `${simulado.titulo} - Concentrify`,
      simulado,
    });
  } catch (error) {
    console.error('Erro ao visualizar simulado:', error);
    req.flash('error', 'Erro ao carregar simulado');
    res.redirect('/simulados');
  }
});

module.exports = router;
