const { supabase } = require('../../config/database');

class ProductService {
  /**
   * Busca todos os produtos
   * @returns {Array} Lista de produtos
   */
  async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de produtos:', error);
      throw error;
    }
  }

  /**
   * Busca um produto por ID
   * @param {string} id - ID do produto
   * @returns {Object|null} Produto ou null
   */
  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar produto:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de produto:', error);
      return null;
    }
  }

  /**
   * Cria um novo produto
   * @param {Object} productData - Dados do produto
   * @returns {Object} Resultado da operação
   */
  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            title: productData.title,
            description: productData.description,
            content_type: productData.content_type || 'pdf',
            is_main: productData.is_main || false,
            order: productData.order || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar produto:', error);
        return {
          success: false,
          message: 'Erro ao criar produto',
        };
      }

      return {
        success: true,
        product: data,
      };
    } catch (error) {
      console.error('Erro no serviço de criação de produto:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  /**
   * Atualiza um produto
   * @param {string} id - ID do produto
   * @param {Object} productData - Dados atualizados
   * @returns {Object} Resultado da operação
   */
  async updateProduct(id, productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          title: productData.title,
          description: productData.description,
          content_type: productData.content_type,
          is_main: productData.is_main,
          order: productData.order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        return {
          success: false,
          message: 'Erro ao atualizar produto',
        };
      }

      return {
        success: true,
        product: data,
      };
    } catch (error) {
      console.error('Erro no serviço de atualização de produto:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  /**
   * Remove um produto
   * @param {string} id - ID do produto
   * @returns {Object} Resultado da operação
   */
  async deleteProduct(id) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) {
        console.error('Erro ao remover produto:', error);
        return {
          success: false,
          message: 'Erro ao remover produto',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Erro no serviço de remoção de produto:', error);
      return {
        success: false,
        message: 'Erro interno do servidor',
      };
    }
  }

  /**
   * Busca produtos por categoria
   * @param {string} category - Categoria dos produtos
   * @returns {Array} Lista de produtos da categoria
   */
  async getProductsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos por categoria:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de produtos por categoria:', error);
      throw error;
    }
  }

  /**
   * Busca produtos com paginação
   * @param {Object} paginationParams - Parâmetros de paginação
   * @returns {Object} Produtos paginados
   */
  async getProductsPaginated(paginationParams) {
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .range(
          paginationParams.offset,
          paginationParams.offset + paginationParams.limit - 1,
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos paginados:', error);
        throw error;
      }

      return {
        data: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Erro no serviço de produtos paginados:', error);
      throw error;
    }
  }

  /**
   * Busca produtos por tipo (main ou bonus)
   * @param {boolean} isMain - Se deve buscar produtos principais
   * @returns {Array} Lista de produtos do tipo especificado
   */
  async getProductsByType(isMain) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_main', isMain)
        .order('order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos por tipo:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de produtos por tipo:', error);
      throw error;
    }
  }
}

module.exports = ProductService;
