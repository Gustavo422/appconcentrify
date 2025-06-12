const bcrypt = require('bcryptjs');
const { supabase } = require('../../config/database');

class AuthService {
  /**
   * Realiza o login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Object} Resultado da operação
   */
  async login(email, password) {
    try {
      // Buscar usuário por email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !user) {
        return {
          success: false,
          message: 'Email ou senha incorretos',
        };
      }

      // Verificar senha
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Email ou senha incorretos',
        };
      }

      // Atualizar último login
      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Retornar dados do usuário para sessão
      const sessionUser = {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at,
      };

      return {
        success: true,
        user: sessionUser,
      };
    } catch (error) {
      console.error('Erro no serviço de login:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  /**
   * Registra um novo usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Object} Resultado da operação
   */
  async register(email, password) {
    try {
      // Verificar se o email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        return {
          success: false,
          message: 'Este email já está cadastrado',
        };
      }

      // Hash da senha
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Criar usuário
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            email: email.toLowerCase(),
            password_hash: passwordHash,
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        return {
          success: false,
          message: 'Erro ao criar usuário',
        };
      }

      return {
        success: true,
        user: newUser,
      };
    } catch (error) {
      console.error('Erro no serviço de registro:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  /**
   * Verifica se um usuário existe
   * @param {string} email - Email do usuário
   * @returns {boolean} True se o usuário existe
   */
  async userExists(email) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      return !!user;
    } catch {
      return false;
    }
  }

  /**
   * Busca usuário por ID
   * @param {string} userId - ID do usuário
   * @returns {Object|null} Dados do usuário ou null
   */
  async getUserById(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }
}

module.exports = AuthService;
