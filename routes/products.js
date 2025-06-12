const express = require('express');
const multer = require('multer');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const ProductController = require('../src/controllers/ProductController');

const router = express.Router();

// Configurar multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas PDFs e JSONs
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/json' ||
        file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF e JSON são permitidos'), false);
    }
  }
});

/**
 * GET /products
 * Listar produtos
 */
router.get('/', requireAuth, ProductController.index);

/**
 * GET /products/create
 * Formulário de criação (apenas admin)
 */
router.get('/create', requireAdmin, ProductController.create);

/**
 * POST /products
 * Criar produto (apenas admin)
 */
router.post('/', requireAdmin, upload.single('file_upload'), ProductController.store);

/**
 * POST /products/upload
 * Upload de arquivo (apenas admin)
 */
router.post('/upload', requireAdmin, upload.single('file'), ProductController.upload);

/**
 * POST /products/validate-json
 * Validar JSON (apenas admin)
 */
router.post('/validate-json', requireAdmin, ProductController.validateJSON);

/**
 * GET /products/:id
 * Visualizar produto específico
 */
router.get('/:id', requireAuth, ProductController.show);

/**
 * GET /products/:id/edit
 * Formulário de edição (apenas admin)
 */
router.get('/:id/edit', requireAdmin, ProductController.edit);

/**
 * PUT /products/:id
 * Atualizar produto (apenas admin)
 */
router.put('/:id', requireAdmin, upload.single('file_upload'), ProductController.update);

/**
 * DELETE /products/:id
 * Remover produto (apenas admin)
 */
router.delete('/:id', requireAdmin, ProductController.destroy);

module.exports = router;