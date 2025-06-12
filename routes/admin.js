const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/database');
const { requireAdmin } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

const router = express.Router();

/**
 * GET /admin/dashboard
 * Dashboard administrativo
 */
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    // Buscar estatísticas
    const { data: usersCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    const { data: productsCount } = await supabase
      .from('products')
      .select('id', { count: 'exact' });

    const { data: simuladosCount } = await supabase
      .from('simulados')
      .select('id', { count: 'exact' });

    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, email, created_at, last_login, is_admin')
      .order('created_at', { ascending: false })
      .limit(5);

    res.render('admin/dashboard', {
      title: 'Dashboard Administrativo - Concentrify',
      stats: {
        users: usersCount?.length || 0,
        products: productsCount?.length || 0,
        simulados: simuladosCount?.length || 0,
      },
      recentUsers: recentUsers || [],
    });
  } catch (error) {
    console.error('Erro no dashboard admin:', error);
    req.flash('error', 'Erro ao carregar dashboard');
    res.redirect('/products');
  }
});

/**
 * GET /admin/users
 * Listar usuários
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, is_admin, created_at, last_login')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Contar total de usuários
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    const totalPages = Math.ceil((totalUsers || 0) / limit);

    res.render('admin/users', {
      title: 'Gerenciar Usuários - Concentrify',
      users: users || [],
      pagination: {
        currentPage: page,
        totalPages: totalPages || 1,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    req.flash('error', 'Erro ao carregar usuários');
    res.redirect('/admin/dashboard');
  }
});

/**
 * GET /admin/users/new
 * Formulário para novo usuário
 */
router.get('/users/new', requireAdmin, (req, res) => {
  res.render('admin/users/form', {
    title: 'Novo Usuário - Concentrify',
    user: null,
    isEdit: false,
  });
});

/**
 * GET /admin/users/test
 * Formulário de teste simplificado
 */
router.get('/users/test', requireAdmin, (req, res) => {
  res.render('admin/users/form-simple', {
    title: 'Novo Usuário - Teste',
  });
});

/**
 * GET /admin/users/debug
 * Formulário de debug sem validação JavaScript
 */
router.get('/users/debug', requireAdmin, (req, res) => {
  res.render('admin/users/form-debug', {
    title: 'Debug - Novo Usuário',
  });
});

/**
 * GET /admin/users/new-form
 * Novo formulário completo com visualização de senha
 */
router.get('/users/new-form', requireAdmin, (req, res) => {
  res.render('admin/users/form-new', {
    title: 'Novo Usuário - Concentrify',
  });
});

// Funções auxiliares para criação de usuário
const validateUserEmail = async (email) => {
  if (!email || !email.trim()) {
    throw new Error('Email é obrigatório');
  }

  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error('Erro ao verificar email. Tente novamente.');
  }

  if (existingUser) {
    throw new Error('Este email já está cadastrado no sistema');
  }

  return email.toLowerCase().trim();
};

const generateUserPassword = (password) => {
  if (password && password.trim() && password.trim().length >= 6) {
    return {
      password: password.trim(),
      message: 'Usuário criado com sucesso usando a senha fornecida',
    };
  }

  const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2);
  return {
    password: tempPassword,
    message: `Usuário criado com sucesso! Senha temporária: ${tempPassword}`,
  };
};

const createUserInDatabase = async (userData) => {
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (createError) {
    if (createError.code === '23505') {
      throw new Error('Este email já está cadastrado no sistema');
    } else if (createError.code === '23502') {
      throw new Error('Dados obrigatórios não fornecidos');
    } else {
      throw new Error('Erro ao criar usuário. Tente novamente.');
    }
  }

  return newUser;
};

router.post(
  '/users',
  requireAdmin,
  validate(schemas.user),
  async (req, res) => {
    try {
      console.log('🔍 DEBUG - Dados recebidos:', req.body);

      const { email, password, is_admin } = req.body;

      console.log('📧 Email:', email);
      console.log('🔑 Password:', password ? 'Fornecida' : 'Não fornecida');
      console.log('👑 Is Admin:', is_admin);

      // Validar email
      const validatedEmail = await validateUserEmail(email);

      // Gerar senha
      const { password: finalPassword, message: passwordMessage } = generateUserPassword(password);
      const passwordHash = await bcrypt.hash(finalPassword, 12);

      // Criar usuário
      const userData = {
        email: validatedEmail,
        password_hash: passwordHash,
        is_admin: Boolean(is_admin),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newUser = await createUserInDatabase(userData);

      console.log('✅ Usuário criado com sucesso:', newUser.email);
      req.flash('success', passwordMessage);
      res.redirect('/admin/users');
    } catch (error) {
      console.error('❌ Erro geral ao criar usuário:', error);
      req.flash('error', error.message || 'Erro interno do servidor. Tente novamente.');
      res.redirect('/admin/users/new');
    }
  },
);

/**
 * GET /admin/users/:id
 * Visualizar detalhes do usuário
 */
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, is_admin, created_at, updated_at, last_login')
      .eq('id', id)
      .single();

    if (error || !user) {
      req.flash('error', 'Usuário não encontrado');
      return res.redirect('/admin/users');
    }

    res.render('admin/users/view', {
      title: 'Detalhes do Usuário - Concentrify',
      user,
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    req.flash('error', 'Erro ao carregar usuário');
    res.redirect('/admin/users');
  }
});

/**
 * GET /admin/users/:id/edit
 * Formulário para editar usuário
 */
router.get('/users/:id/edit', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, is_admin, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      req.flash('error', 'Usuário não encontrado');
      return res.redirect('/admin/users');
    }

    res.render('admin/users/form', {
      title: 'Editar Usuário - Concentrify',
      user,
      isEdit: true,
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    req.flash('error', 'Erro ao carregar usuário');
    res.redirect('/admin/users');
  }
});

// Funções auxiliares para atualização de usuário
const validateUserExists = async (id) => {
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', id)
    .single();

  if (!existingUser) {
    throw new Error('Usuário não encontrado');
  }

  return existingUser;
};

const validateEmailUniqueness = async (email, userId, currentEmail) => {
  if (email.toLowerCase() !== currentEmail) {
    const { data: emailExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .neq('id', userId)
      .single();

    if (emailExists) {
      throw new Error('Este email já está cadastrado para outro usuário');
    }
  }
};

const updateUserInDatabase = async (id, userData) => {
  const { error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id);

  if (error) {
    throw error;
  }
};

/**
 * PUT /admin/users/:id
 * Atualizar usuário
 */
router.put(
  '/users/:id',
  requireAdmin,
  validate(schemas.user),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, is_admin } = req.body;

      // Verificar se o usuário existe
      const existingUser = await validateUserExists(id);

      // Verificar se o email já existe (exceto para o usuário atual)
      await validateEmailUniqueness(email, id, existingUser.email);

      // Atualizar usuário
      const userData = {
        email: email.toLowerCase(),
        is_admin: Boolean(is_admin),
        updated_at: new Date().toISOString(),
      };

      await updateUserInDatabase(id, userData);

      req.flash('success', 'Usuário atualizado com sucesso!');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      req.flash('error', error.message || 'Erro ao atualizar usuário');
      res.redirect(`/admin/users/${req.params.id}/edit`);
    }
  },
);

/**
 * DELETE /admin/users/:id
 * Excluir usuário
 */
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir excluir o próprio usuário
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Você não pode excluir seu próprio usuário',
      });
    }

    // Verificar se o usuário existe
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Excluir usuário
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir usuário',
    });
  }
});

/**
 * POST /admin/users/:id/reset-password
 * Resetar senha do usuário
 */
router.post('/users/:id/reset-password', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário existe
    const { data: user } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', id)
      .single();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    // Gerar nova senha temporária
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Atualizar senha
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: `Senha resetada com sucesso! Nova senha: ${tempPassword}`,
    });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao resetar senha',
    });
  }
});

// Rota para formulário de teste funcional
router.get('/users/form-working', (req, res) => {
  res.render('admin/users/form-working');
});

// Rota para formulário de teste minimalista
router.get('/users/form-test', (req, res) => {
  res.render('admin/users/form-test');
});

// Rota para formulário de debug
router.get('/users/form-debug', (req, res) => {
  res.render('admin/users/form-debug');
});

module.exports = router;
