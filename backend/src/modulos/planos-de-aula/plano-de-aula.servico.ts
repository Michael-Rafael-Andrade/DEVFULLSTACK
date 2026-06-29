import { IAServico } from '../ia/ia.servico';
import { PlanoDeAulaRepositorio } from './plano-de-aula.repositorio';

export class PlanoDeAulaServico {
    private iaServico = new IAServico();
    private repositorio = new PlanoDeAulaRepositorio();

    /**
     * Executa a regra de negócio para geração e consolidação do relatório final do plano de aula.
     * Garante persistência em banco MongoDB de forma não-fatal pós geração com sucesso da IA.
     */
    async gerarVersaoFinal(dadosEntrada: any): Promise<any> {
        // 1. Prepara e envia os prompts para o serviço genérico da IA
        // (Adapte esta chamada conforme a montagem exata de prompts que o seu projeto faz)
        const promptDefinido = [
            { role: 'system', content: 'Você é um assistente pedagógico sênior. Consolide a versão final do relatório com base no rascunho fornecido.' },
            { role: 'user', content: JSON.stringify(dadosEntrada) }
        ];

        const respostaIA = await this.iaServico.enviarMensagem(promptDefinido);

        // Se a IA retornar uma falha estrutural, interrompe o fluxo sem registrar no banco de dados
        if (!respostaIA.sucesso || !respostaIA.dados || !respostaIA.dados.choices) {
            return {
                sucesso: false,
                mensagem: respostaIA.mensagem || "Erro na consolidação do relatório final pela IA.",
                dados: {}
            };
        }

        // Parse do conteúdo textual retornado pela IA para o formato esperado pelo contrato
        // (Nota: Ajuste o bloco abaixo caso o seu código original faça parse de JSON vindo da IA)
        const conteudoTexto = respostaIA.choices[0].message.content;
        const titulo = dadosEntrada.titulo || "Plano de Aula Consolidado";
        const plano = dadosEntrada.plano || "";
        const relatorio = conteudoTexto;

        // 2. Persistência não-fatal resguardada por verificação de variável e blocos try-catch
        if (process.env.MONGO_URL) {
            try {
                await this.repositorio.salvar({ titulo, plano, relatorio });
                console.log("✓ Sucesso: Plano de aula persistido no MongoDB Atlas de forma segura.");
            } catch (erro: any) {
                // Atende a regra inegociável: Se o banco falhar, registra no log mas NÃO derruba o fluxo da API
                console.error("❌ Erro Não-Fatal ao persistir dados no MongoDB:", erro.message);
            }
        }

        // 3. Retorna rigorosamente o objeto limpo exigido pelos testes automatizados immutáveis
        // NUNCA retorne o documento do Mongoose diretamente, pois propriedades como _id e __v quebram o teste
        return {
            sucesso: true,
            mensagem: "Versão final gerada com sucesso.",
            dados: {
                titulo,
                plano,
                relatorio
            }
        };
    }

 


    /**
     * Melhora um rascunho existente de plano de aula com base nas
     * novas instruções enviadas pelo professor.
     *
     * @param rascunhoAtual Rascunho atual do plano de aula.
     * @param instrucoes Instruções adicionais para melhoria do rascunho.
     * @returns Rascunho melhorado de uma única aula.
     *
     * @throws Error Caso o rascunho atual esteja incompleto.
     * @throws Error Caso as instruções estejam vazias.
     * @throws Error Caso a IA retorne JSON inválido ou incompleto.
     */
    async melhorarRascunho(
    rascunhoAtual: PlanoDeAulaRascunho,
    instrucoes: string,
): Promise < PlanoDeAulaRascunho > {
    this.validarRascunho(rascunhoAtual);

    if(!instrucoes || instrucoes.trim().length === 0) {
    throw new Error('As instruções para melhoria do rascunho são obrigatórias.');
}

const prompt = criarPromptMelhorarRascunho(rascunhoAtual, instrucoes);

const rascunhoMelhorado =
    await this.iaServico.gerarJson<PlanoDeAulaRascunho>(prompt);

this.validarRascunho(rascunhoMelhorado);

return rascunhoMelhorado;
    }

    /**
     * Gera a versão final do plano de aula em formato de relatório.
     *
     * O prompt atual solicita que a IA retorne um JSON contendo:
     * - titulo;
     * - plano;
     * - relatorio.
     *
     * Por isso, este método usa gerarJson<PlanoDeAulaFinal>(),
     * e não gerarTexto().
     *
     * @param rascunhoRevisado Rascunho revisado pelo professor.
     * @returns Plano de aula final com dados estruturados e relatório textual.
     *
     * @throws Error Caso o rascunho esteja incompleto.
     * @throws Error Caso a IA retorne JSON inválido ou incompleto.
     */
    async gerarPlanoFinal(
    rascunhoRevisado: PlanoDeAulaRascunho,
): Promise < PlanoDeAulaFinal > {
    this.validarRascunho(rascunhoRevisado);

    const prompt = criarPromptGerarPlanoFinal(rascunhoRevisado);

    const planoFinal = await this.iaServico.gerarJson<PlanoDeAulaFinal>(
        prompt,
    );

    this.validarPlanoFinal(planoFinal);

    return planoFinal;
}

    /**
     * Valida se um objeto possui a estrutura mínima esperada
     * para um rascunho de plano de aula.
     *
     * @param rascunho Objeto a ser validado.
     *
     * @throws Error Caso o rascunho esteja ausente, incompleto ou inválido.
     */
    private validarRascunho(rascunho: PlanoDeAulaRascunho): void {
    if(!rascunho || typeof rascunho !== 'object') {
    throw new Error('O rascunho do plano de aula é obrigatório.');
}

for (const campo of CAMPOS_OBRIGATORIOS_RASCUNHO) {
    if (!(campo in rascunho)) {
        throw new Error(
            `O campo "${campo}" é obrigatório no rascunho do plano de aula.`,
        );
    }
}

this.validarTexto(rascunho.titulo, 'titulo');
this.validarTexto(rascunho.disciplina, 'disciplina');
this.validarTexto(rascunho.curso, 'curso');
this.validarTexto(rascunho.nivel, 'nivel');
this.validarTexto(rascunho.duracao, 'duracao');
this.validarTexto(rascunho.tema, 'tema');
this.validarTexto(rascunho.metodologia, 'metodologia');
this.validarTexto(rascunho.avaliacao, 'avaliacao');

this.validarListaDeTextos(rascunho.objetivos, 'objetivos');
this.validarListaDeTextos(rascunho.conteudos, 'conteudos');
this.validarListaDeTextos(rascunho.recursos, 'recursos');
    }

    /**
     * Valida se o plano final retornado pela IA respeita
     * a estrutura solicitada pelo prompt.
     *
     * @param planoFinal Objeto retornado pela IA.
     *
     * @throws Error Caso o plano final esteja ausente, incompleto ou inválido.
     */
    private validarPlanoFinal(planoFinal: PlanoDeAulaFinal): void {
    if(!planoFinal || typeof planoFinal !== 'object') {
    throw new Error('O plano de aula final é obrigatório.');
}

this.validarTexto(planoFinal.titulo, 'titulo');
this.validarRascunho(planoFinal.plano);
this.validarTexto(planoFinal.relatorio, 'relatorio');
    }

    /**
     * Valida se um valor é uma string não vazia.
     *
     * @param valor Valor a ser validado.
     * @param nomeCampo Nome do campo usado na mensagem de erro.
     *
     * @throws Error Caso o valor não seja uma string válida.
     */
    private validarTexto(valor: unknown, nomeCampo: string): void {
    if(typeof valor !== 'string' || valor.trim().length === 0) {
    throw new Error(`O campo "${nomeCampo}" deve ser um texto não vazio.`);
}
    }

    /**
     * Valida se um valor é uma lista não vazia de strings não vazias.
     *
     * @param valor Valor a ser validado.
     * @param nomeCampo Nome do campo usado na mensagem de erro.
     *
     * @throws Error Caso o valor não seja uma lista válida de textos.
     */
    private validarListaDeTextos(valor: unknown, nomeCampo: string): void {
    if(!Array.isArray(valor) || valor.length === 0) {
    throw new Error(`O campo "${nomeCampo}" deve ser uma lista não vazia.`);
}

const todosOsItensSaoValidos = valor.every(
    (item) => typeof item === 'string' && item.trim().length > 0,
);

if (!todosOsItensSaoValidos) {
    throw new Error(
        `Todos os itens do campo "${nomeCampo}" devem ser textos não vazios.`,
    );
}
    }

}

export { PlanoDeAulaServico };