const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const ProductController = require('../src/controllers/ProductController');

const router = express.Router();

/**
 * GET /products
 * Listar produtos
 */
router.get('/', requireAuth, ProductController.index);

/**
 * GET /products/create
 * Formulário de criação (apenas admin)
 */
router.get('/create', requireAuth, ProductController.create);

/**
 * POST /products
 * Criar produto (apenas admin)
 */
router.post('/', requireAuth, ProductController.store);

/**
 * GET /products/:id
 * Visualizar produto específico
 */
router.get('/:id', requireAuth, ProductController.show);

/**
 * GET /products/:id/edit
 * Formulário de edição (apenas admin)
 */
router.get('/:id/edit', requireAuth, ProductController.edit);

/**
 * PUT /products/:id
 * Atualizar produto (apenas admin)
 */
router.put('/:id', requireAuth, ProductController.update);

/**
 * DELETE /products/:id
 * Remover produto (apenas admin)
 */
router.delete('/:id', requireAuth, ProductController.destroy);

module.exports = router;
