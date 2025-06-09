const express = require('express');
const { supabase } = require('../config/database');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /products
 * Listar produtos
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    // Buscar produtos principais
    const { data: mainProducts, error: mainError } = await supabase
      .from('products')
      .select('*')
      .eq('is_main', true)
      .order('order', { ascending: true });

    if (mainError) {
      throw mainError;
    }

    // Buscar produtos bônus
    const { data: bonusProducts, error: bonusError } = await supabase
      .from('products')
      .select('*')
      .eq('is_main', false)
      .order('order', { ascending: true });

    if (bonusError) {
      throw bonusError;
    }

    res.render('products/index', {
      title: 'Produtos - Concentrify',
      mainProducts: mainProducts || [],
      bonusProducts: bonusProducts || []
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    req.flash('error', 'Erro ao carregar produtos');
    res.render('products/index', {
      title: 'Produtos - Concentrify',
      mainProducts: [],
      bonusProducts: []
    });
  }
});

/**
 * GET /products/:id
 * Visualizar produto específico
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      req.flash('error', 'Produto não encontrado');
      return res.redirect('/products');
    }

    // Redirecionar baseado no tipo de conteúdo
    switch (product.content_type) {
      case 'macetes':
        return res.redirect('/macetes');
      case 'simulados':
        return res.redirect('/simulados');
      case 'questoes_semanais':
        return res.redirect('/questoes-semanais');
      case 'pdf':
      default:
        return res.render('products/view-pdf', {
          title: `${product.title} - Concentrify`,
          product
        });
    }
  } catch (error) {
    console.error('Erro ao visualizar produto:', error);
    req.flash('error', 'Erro ao carregar produto');
    res.redirect('/products');
  }
});

module.exports = router;