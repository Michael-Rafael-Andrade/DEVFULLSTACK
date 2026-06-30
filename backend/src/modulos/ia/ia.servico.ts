import axios from 'axios';

/**
 * Interface que representa a estrutura de mensagens esperada pela API de Chat Completions.
 */
export interface MensagemIA {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Serviço genérico responsável pela integração com o provedor de Inteligência Artificial.
 * Implementa compatibilidade com o formato OpenAI Chat Completions utilizado pelo Google Gemini.
 * Atende às diretrizes de tratamento robusto de falhas e manutenção do contrato de resposta da aplicação.
 */
export class IAServico {
  private apiUrl = process.env.AI_API_URL;
  private model = process.env.AI_MODEL || 'gemini-2.0-flash';
  private apiKey = process.env.AI_API_KEY;

  /**
   * Envia um histórico de mensagens estruturado para o provedor de IA configurado por variáveis de ambiente.
   * * @param mensagens Lista de mensagens contendo o contexto e as interações do usuário.
   * @returns Objeto de resposta contendo a estrutura de completions ou tratamento amigável de erro.
   */
  async enviarMensagem(mensagens: MensagemIA[]): Promise<any> {
    if (!this.apiKey || !this.apiUrl) {
      return {
        sucesso: false,
        mensagem: "Configuração de IA incompleta: Verifique as variáveis de ambiente AI_API_KEY e AI_API_URL.",
        dados: {}
      };
    }

    try {
      const resposta = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: mensagens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000 // Timeout estendido para 25 segundos para evitar travamentos em respostas longas
        }
      );

      return resposta.data;

    } catch (erro: any) {
      console.error("Falha detectada na comunicação com o provedor de IA externa:", erro.message);

      let mensagemAmigavel = "Não foi possível estabelecer contato com o motor de IA neste momento. Tente novamente.";

      if (erro.response) {
        const status = erro.response.status;
        // Tratamento explícito de cota e limites do Free Tier do Gemini (Erro 429)
        if (status === 429) {
          mensagemAmigavel = "O limite de requisições gratuitas do Gemini foi atingido. Aguarde cerca de 1 minuto e tente novamente.";
        } else if (status === 401 || status === 403) {
          mensagemAmigavel = "Chave de autenticação da API de IA inválida ou expirada. Notifique o administrador.";
        } else if (status === 404) {
          mensagemAmigavel = "O modelo de IA solicitado ou o endpoint especificado não foram encontrados no provedor.";
        }
      } else if (erro.code === 'ECONNABORTED') {
        mensagemAmigavel = "O tempo limite de espera para geração do plano pedagógico foi esgotado pelo provedor.";
      }

      // Mantém o formato padrão estipulado em contrato OpenAPI sem estourar erro 500 fatal na API
      return {
        sucesso: false,
        mensagem: mensagemAmigavel,
        dados: {}
      };
    }
  }
}