const ProductService = require('../services/ProductService');
const { validateProduct } = require('../validators/productValidators');

class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Lista todos os produtos
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
   * Mostra um produto específico
   */
  show = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        req.flash('error', 'Produto não encontrado');
        return res.redirect('/products');
      }

      res.render('products/show', {
        title: `${product.name} - Concentrify`,
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
        title: `Editar ${product.name} - Concentrify`,
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
        req.flash('error', 'Acesso restrito a administradores');
        return res.redirect('/products');
      }

      const { id } = req.params;
      const result = await this.productService.deleteProduct(id);

      if (!result.success) {
        req.flash('error', result.message);
        return res.redirect('/products');
      }

      req.flash('success', 'Produto removido com sucesso!');
      res.redirect('/products');
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
      res.redirect('/products');
    }
  };
}

module.exports = new ProductController();
