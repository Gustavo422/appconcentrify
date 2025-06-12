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
        .order('order', { ascending: true })
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
            cover_image: productData.cover_image,
            content_type: productData.content_type || 'pdf',
            file_url: productData.file_url,
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
          cover_image: productData.cover_image,
          content_type: productData.content_type,
          file_url: productData.file_url,
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

  /**
   * Busca produtos por tipo de conteúdo
   * @param {string} contentType - Tipo de conteúdo
   * @returns {Array} Lista de produtos do tipo especificado
   */
  async getProductsByContentType(contentType) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('content_type', contentType)
        .order('order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos por tipo de conteúdo:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de produtos por tipo de conteúdo:', error);
      throw error;
    }
  }

  /**
   * Valida estrutura JSON para simulados
   * @param {Object} jsonData - Dados JSON a serem validados
   * @returns {Object} Resultado da validação
   */
  validateSimuladoJSON(jsonData) {
    try {
      // Verificar campos obrigatórios
      if (!jsonData.titulo) {
        return { isValid: false, error: 'Campo "titulo" é obrigatório' };
      }

      if (!jsonData.areas_conhecimento || !Array.isArray(jsonData.areas_conhecimento)) {
        return { isValid: false, error: 'Campo "areas_conhecimento" deve ser um array' };
      }

      // Validar cada área de conhecimento
      for (const area of jsonData.areas_conhecimento) {
        if (!area.materia) {
          return { isValid: false, error: 'Campo "materia" é obrigatório em cada área' };
        }

        if (!area.questoes || !Array.isArray(area.questoes)) {
          return { isValid: false, error: 'Campo "questoes" deve ser um array em cada área' };
        }

        // Validar cada questão
        for (const questao of area.questoes) {
          if (!questao.enunciado) {
            return { isValid: false, error: 'Campo "enunciado" é obrigatório em cada questão' };
          }

          if (!questao.alternativas || typeof questao.alternativas !== 'object') {
            return { isValid: false, error: 'Campo "alternativas" deve ser um objeto' };
          }

          // Verificar se tem as alternativas A, B, C, D, E
          const alternativasObrigatorias = ['A', 'B', 'C', 'D', 'E'];
          for (const alt of alternativasObrigatorias) {
            if (!questao.alternativas[alt]) {
              return { isValid: false, error: `Alternativa "${alt}" é obrigatória` };
            }
          }

          if (!questao.correta || !alternativasObrigatorias.includes(questao.correta)) {
            return { isValid: false, error: 'Campo "correta" deve ser A, B, C, D ou E' };
          }
        }
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Erro ao validar JSON: ' + error.message };
    }
  }

  /**
   * Valida estrutura JSON para macetes
   * @param {Array} jsonData - Dados JSON a serem validados
   * @returns {Object} Resultado da validação
   */
  validateMacetesJSON(jsonData) {
    try {
      if (!Array.isArray(jsonData)) {
        return { isValid: false, error: 'Macetes devem ser um array' };
      }

      for (const macete of jsonData) {
        if (!macete.classe) {
          return { isValid: false, error: 'Campo "classe" é obrigatório em cada macete' };
        }

        if (!macete.nivel || !['Básico', 'Intermediário', 'Especialista'].includes(macete.nivel)) {
          return { isValid: false, error: 'Campo "nivel" deve ser Básico, Intermediário ou Especialista' };
        }

        if (!macete.macete) {
          return { isValid: false, error: 'Campo "macete" é obrigatório' };
        }

        if (!macete.explicacao) {
          return { isValid: false, error: 'Campo "explicacao" é obrigatório' };
        }
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Erro ao validar JSON: ' + error.message };
    }
  }

  /**
   * Upload de arquivo para Supabase Storage
   * @param {File} file - Arquivo a ser enviado
   * @param {string} bucket - Bucket do Supabase
   * @param {string} path - Caminho do arquivo
   * @returns {Object} Resultado do upload
   */
  async uploadFile(file, bucket, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) {
        console.error('Erro no upload:', error);
        return { success: false, error: error.message };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('Erro no serviço de upload:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = ProductService;