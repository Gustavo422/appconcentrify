const ProductService = require('../services/ProductService');
const { validateProduct } = require('../validators/productValidators');

class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Lista todos os produtos organizados por tipo
   */
  index = async (req, res) => {
    try {
      // Buscar produtos principais e bônus separadamente
      const [mainProducts, bonusProducts] = await Promise.all([
        this.productService.getProductsByType(true),
        this.productService.getProductsByType(false)
      ]);
      
      res.render('products/index', {
        title: 'Produtos - Concentrify',
        mainProducts,
        bonusProducts,
        user: req.user,
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      req.flash('error', 'Erro ao carregar produtos');
      res.redirect('/');
    }
  };

  /**
   * Mostra um produto específico com roteamento inteligente
   */
  show = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        req.flash('error', 'Produto não encontrado');
        return res.redirect('/products');
      }

      // Roteamento inteligente baseado no tipo de conteúdo
      const contentRoutes = {
        'pdf': () => this.showPDF(req, res, product),
        'simulados': () => res.redirect(`/simulados/${id}`),
        'questoes_semanais': () => res.redirect(`/questoes-semanais/${id}`),
        'macetes': () => res.redirect(`/macetes/${id}`)
      };

      const routeHandler = contentRoutes[product.content_type];
      if (routeHandler) {
        return routeHandler();
      }

      // Fallback para visualização padrão
      res.render('products/show', {
        title: `${product.title} - Concentrify`,
        product,
        user: req.user,
      });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      req.flash('error', 'Erro ao carregar produto');
      res.redirect('/products');
    }
  };

  /**
   * Visualização específica para PDFs
   */
  showPDF = async (req, res, product) => {
    try {
      // Buscar produtos relacionados do mesmo tipo
      const relatedProducts = await this.productService.getProductsByContentType('pdf');
      const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 3);

      res.render('products/view_pdf', {
        title: `${product.title} - Concentrify`,
        product,
        relatedProducts: filteredRelated,
        user: req.user,
      });
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
      req.flash('error', 'Erro ao carregar PDF');
      res.redirect('/products');
    }
  };

  /**
   * Mostra formulário de criação de produto (apenas admin)
   */
  create = async (req, res) => {
    if (!req.user?.is_admin) {
      req.flash('error', 'Acesso restrito a administradores');
      return res.redirect('/products');
    }

    res.render('products/create', {
      title: 'Criar Produto - Concentrify',
      user: req.user,
    });
  };

  /**
   * Cria um novo produto (apenas admin)
   */
  store = async (req, res) => {
    try {
      if (!req.user?.is_admin) {
        req.flash('error', 'Acesso restrito a administradores');
        return res.redirect('/products/create');
      }

      const validation = validateProduct(req.body);
      if (!validation.isValid) {
        req.flash('error', validation.errors[0]);
        return res.redirect('/products/create');
      }

      // Validar JSON se for simulado, questões semanais ou macetes
      if (['simulados', 'questoes_semanais', 'macetes'].includes(req.body.content_type)) {
        if (req.body.json_content) {
          try {
            const jsonData = JSON.parse(req.body.json_content);
            let jsonValidation;

            if (req.body.content_type === 'simulados' || req.body.content_type === 'questoes_semanais') {
              jsonValidation = this.productService.validateSimuladoJSON(jsonData);
            } else if (req.body.content_type === 'macetes') {
              jsonValidation = this.productService.validateMacetesJSON(jsonData);
            }

            if (!jsonValidation.isValid) {
              req.flash('error', 'Erro na validação JSON: ' + jsonValidation.error);
              return res.redirect('/products/create');
            }
          } catch (error) {
            req.flash('error', 'JSON inválido: ' + error.message);
            return res.redirect('/products/create');
          }
        }
      }

      const result = await this.productService.createProduct(req.body);

      if (!result.success) {
        req.flash('error', result.message);
        return res.redirect('/products/create');
      }

      req.flash('success', 'Produto criado com sucesso!');
      res.redirect('/products');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
      res.redirect('/products/create');
    }
  };

  /**
   * Mostra formulário de edição (apenas admin)
   */
  edit = async (req, res) => {
    try {
      if (!req.user?.is_admin) {
        req.flash('error', 'Acesso restrito a administradores');
        return res.redirect('/products');
      }

      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        req.flash('error', 'Produto não encontrado');
        return res.redirect('/products');
      }

      res.render('products/edit', {
        title: `Editar ${product.title} - Concentrify`,
        product,
        user: req.user,
      });
    } catch (error) {
      console.error('Erro ao carregar produto para edição:', error);
      req.flash('error', 'Erro ao carregar produto');
      res.redirect('/products');
    }
  };

  /**
   * Atualiza um produto (apenas admin)
   */
  update = async (req, res) => {
    try {
      if (!req.user?.is_admin) {
        req.flash('error', 'Acesso restrito a administradores');
        return res.redirect('/products');
      }

      const { id } = req.params;
      const validation = validateProduct(req.body);

      if (!validation.isValid) {
        req.flash('error', validation.errors[0]);
        return res.redirect(`/products/${id}/edit`);
      }

      const result = await this.productService.updateProduct(id, req.body);

      if (!result.success) {
        req.flash('error', result.message);
        return res.redirect(`/products/${id}/edit`);
      }

      req.flash('success', 'Produto atualizado com sucesso!');
      res.redirect('/products');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
      res.redirect('/products');
    }
  };

  /**
   * Remove um produto (apenas admin)
   */
  destroy = async (req, res) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({
          success: false,
          error: 'Acesso restrito a administradores'
        });
      }

      const { id } = req.params;
      const result = await this.productService.deleteProduct(id);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.message
        });
      }

      res.json({
        success: true,
        message: 'Produto removido com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Upload de arquivo
   */
  upload = async (req, res) => {
    try {
      if (!req.user?.is_admin) {
        return res.status(403).json({
          success: false,
          error: 'Acesso restrito a administradores'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado'
        });
      }

      const { content_type } = req.body;
      const file = req.file;
      
      // Determinar bucket e path baseado no tipo
      const bucket = 'products';
      const path = `${content_type}/${Date.now()}-${file.originalname}`;

      const result = await this.productService.uploadFile(file, bucket, path);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        url: result.url,
        path: result.path
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Validação de JSON
   */
  validateJSON = async (req, res) => {
    try {
      const { content_type, json_content } = req.body;

      if (!json_content) {
        return res.status(400).json({
          success: false,
          error: 'Conteúdo JSON é obrigatório'
        });
      }

      let jsonData;
      try {
        jsonData = JSON.parse(json_content);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'JSON inválido: ' + error.message
        });
      }

      let validation;
      if (content_type === 'simulados' || content_type === 'questoes_semanais') {
        validation = this.productService.validateSimuladoJSON(jsonData);
      } else if (content_type === 'macetes') {
        validation = this.productService.validateMacetesJSON(jsonData);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Tipo de conteúdo não suporta validação JSON'
        });
      }

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      res.json({
        success: true,
        message: 'JSON válido!'
      });
    } catch (error) {
      console.error('Erro na validação JSON:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
}

module.exports = new ProductController();