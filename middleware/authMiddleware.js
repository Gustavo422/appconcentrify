const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { supabase } = require('../config/database');

/**
 * Middleware para verificar se o usuário está autenticado
 */
const requireAuth = async (req, res, next) => {
  try {
    // Verificar se existe sessão
    if (!req.session.user) {
      req.flash('error', 'Você precisa estar logado para acessar esta página');
      return res.redirect('/auth/login');
    }

    // Verificar se o usuário ainda existe no banco
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.session.user.id)
      .single();

    if (error || !user) {
      req.session.destroy();
      req.flash('error', 'Sessão inválida. Faça login novamente');
      return res.redirect('/auth/login');
    }

    // Atualizar dados do usuário na sessão
    req.session.user = user;
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    req.session.destroy();
    res.redirect('/auth/login');
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 */
const requireAdmin = async (req, res, next) => {
  try {
    await requireAuth(req, res, () => {
      if (!req.user.is_admin) {
        req.flash('error', 'Acesso restrito a administradores');
        return res.redirect('/products');
      }
      next();
    });
  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    res.redirect('/auth/login');
  }
};

/**
 * Middleware para verificar se o usuário NÃO está autenticado
 */
const requireGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/products');
  }
  next();
};

/**
 * Middleware opcional de autenticação (não redireciona se não autenticado)
 */
const optionalAuth = async (req, res, next) => {
  try {
    if (req.session.user) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.session.user.id)
        .single();

      if (!error && user) {
        req.session.user = user;
        req.user = user;
      } else {
        req.session.destroy();
      }
    }
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação opcional:', error);
    next();
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireGuest,
  optionalAuth
};