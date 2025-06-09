const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { supabase } = require('../config/database');
const { requireGuest, requireAuth } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * GET /auth/login
 * Página de login
 */
router.get('/login', requireGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Login - Concentrify',
    layout: 'layouts/auth'
  });
});

/**
 * POST /auth/login
 * Processar login
 */
router.post('/login', 
  requireGuest,
  loginLimiter,
  validate(schemas.login),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Buscar usuário por email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !user) {
        req.flash('error', 'Email ou senha incorretos');
        return res.redirect('/auth/login');
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        req.flash('error', 'Email ou senha incorretos');
        return res.redirect('/auth/login');
      }

      // Atualizar último login
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Criar sessão
      req.session.user = {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at
      };

      req.flash('success', 'Login realizado com sucesso!');
      
      // Redirecionar baseado no tipo de usuário
      if (user.is_admin) {
        res.redirect('/admin/dashboard');
      } else {
        res.redirect('/products');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
      res.redirect('/auth/login');
    }
  }
);

/**
 * GET /auth/register
 * Página de registro (apenas para admins)
 */
router.get('/register', requireAuth, async (req, res) => {
  // Verificar se o usuário é admin
  if (!req.user.is_admin) {
    req.flash('error', 'Acesso restrito a administradores');
    return res.redirect('/products');
  }

  res.render('auth/register', {
    title: 'Cadastrar Usuário - Concentrify',
    layout: 'layouts/main'
  });
});

/**
 * POST /auth/register
 * Processar registro (apenas para admins)
 */
router.post('/register',
  requireAuth,
  validate(schemas.register),
  async (req, res) => {
    try {
      // Verificar se o usuário é admin
      if (!req.user.is_admin) {
        req.flash('error', 'Acesso restrito a administradores');
        return res.redirect('/products');
      }

      const { email, password } = req.body;

      // Verificar se o email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        req.flash('error', 'Este email já está cadastrado');
        return res.redirect('/auth/register');
      }

      // Hash da senha
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email: email.toLowerCase(),
          password_hash: passwordHash,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        req.flash('error', 'Erro ao criar usuário');
        return res.redirect('/auth/register');
      }

      req.flash('success', 'Usuário criado com sucesso!');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Erro no registro:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
      res.redirect('/auth/register');
    }
  }
);

/**
 * POST /auth/logout
 * Logout do usuário
 */
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
    }
    res.clearCookie('concentrify.sid');
    req.flash('success', 'Logout realizado com sucesso');
    res.redirect('/auth/login');
  });
});

/**
 * GET /auth/logout (para compatibilidade)
 */
router.get('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
    }
    res.clearCookie('concentrify.sid');
    res.redirect('/auth/login');
  });
});

module.exports = router;