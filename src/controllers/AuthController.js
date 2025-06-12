const AuthService = require('../services/AuthService');
const {
  validateLogin,
  validateRegister,
} = require('../validators/authValidators');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Renderiza a página de login
   */
  showLogin = async (req, res) => {
    res.render('auth/login', {
      title: 'Login - Concentrify',
      layout: 'layouts/auth',
    });
  };

  /**
   * Processa o login do usuário
   */
  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validar dados de entrada
      const validation = validateLogin({ email, password });
      if (!validation.isValid) {
        req.flash('error', validation.errors[0]);
        return res.redirect('/auth/login');
      }

      // Tentar fazer login
      const result = await this.authService.login(email, password);

      if (!result.success) {
        req.flash('error', result.message);
        return res.redirect('/auth/login');
      }

      // Criar sessão
      req.session.user = result.user;
      req.flash('success', 'Login realizado com sucesso!');

      // Redirecionar baseado no tipo de usuário
      const redirectPath = result.user.is_admin
        ? '/admin/dashboard'
        : '/products';
      res.redirect(redirectPath);
    } catch (error) {
      console.error('Erro no login:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
      res.redirect('/auth/login');
    }
  };

  /**
   * Renderiza a página de registro (apenas para admins)
   */
  showRegister = async (req, res) => {
    if (!req.user?.is_admin) {
      req.flash('error', 'Acesso restrito a administradores');
      return res.redirect('/products');
    }

    res.render('auth/register', {
      title: 'Cadastrar Usuário - Concentrify',
      layout: 'layouts/main',
    });
  };

  /**
   * Processa o registro de usuário (apenas para admins)
   */
  register = async (req, res) => {
    try {
      if (!req.user?.is_admin) {
        req.flash('error', 'Acesso restrito a administradores');
        return res.redirect('/products');
      }

      const { email, password } = req.body;

      // Validar dados de entrada
      const validation = validateRegister({ email, password });
      if (!validation.isValid) {
        req.flash('error', validation.errors[0]);
        return res.redirect('/auth/register');
      }

      // Tentar criar usuário
      const result = await this.authService.register(email, password);

      if (!result.success) {
        req.flash('error', result.message);
        return res.redirect('/auth/register');
      }

      req.flash('success', 'Usuário criado com sucesso!');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Erro no registro:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
      res.redirect('/auth/register');
    }
  };

  /**
   * Processa o logout do usuário
   */
  logout = async (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Erro ao destruir sessão:', err);
      }
      res.clearCookie('concentrify.sid');
      req.flash('success', 'Logout realizado com sucesso');
      res.redirect('/auth/login');
    });
  };
}

module.exports = new AuthController();
