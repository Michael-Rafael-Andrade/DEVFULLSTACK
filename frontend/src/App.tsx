import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Certifique-se de ter estilos básicos associados

export default function App() {
  const [descricao, setDescricao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // Estados para dados retornados pelas chamadas da API
  const [rascunho, setRascunho] = useState<{ titulo: string; plano: string } | null>(null);
  const [versaoFinal, setVersaoFinal] = useState<{ titulo: string; plano: string; relatorio: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

  // UX 1: Validação reativa e em tempo real no cliente
  const isDescricaoValida = descricao.trim().length >= 10;

  // Determina a etapa corrente do fluxo pedagógico para renderizar o Indicador de Etapas
  const obterEtapaAtual = () => {
    if (versaoFinal) return 3;
    if (rascunho) return 2;
    return 1;
  };
  const etapa = obterEtapaAtual();

  const handleGerarPlano = async () => {
    if (!isDescricaoValida) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await axios.post(`${API_URL}/planos-de-aula/rascunho`, { descricao });
      if (res.data.sucesso) {
        setRascunho(res.data.dados);
      } else {
        setErro(res.data.mensagem);
      }
    } catch (e: any) {
      setErro("Falha crítica na conexão com o servidor do backend ao tentar gerar rascunho.");
    } finally {
      setCarregando(false);
    }
  };

  const handleMelhorarPlano = async () => {
    if (!rascunho) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await axios.post(`${API_URL}/planos-de-aula/rascunho/melhorar`, { rascunho });
      if (res.data.sucesso) {
        setRascunho(res.data.dados);
      } else {
        setErro(res.data.mensagem);
      }
    } catch (e: any) {
      setErro("Falha crítica ao tentar enviar melhorias para a IA.");
    } finally {
      setCarregando(false);
    }
  };

  const handleGerarVersaoFinal = async () => {
    if (!rascunho) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await axios.post(`${API_URL}/planos-de-aula/final`, rascunho);
      if (res.data.sucesso) {
        setVersaoFinal(res.data.dados);
      } else {
        setErro(res.data.mensagem);
      }
    } catch (e: any) {
      setErro("Ocorreu um erro ao submeter e persistir o relatório final no servidor.");
    } finally {
      setCarregando(false);
    }
  };

  const handleNovoPlano = () => {
    setDescricao('');
    setRascunho(null);
    setVersaoFinal(null);
    setErro(null);
  };

  // UX 4: Ação de utilidade prática adicional (Copiar Conteúdo)
  const handleCopiarTexto = () => {
    if (!versaoFinal) return;
    const textoCompleto = `TÍTULO: ${versaoFinal.titulo}\n\nPLANO:\n${versaoFinal.plano}\n\nRELATÓRIO FINAL:\n${versaoFinal.relatorio}`;
    navigator.clipboard.writeText(textoCompleto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="container-app">
      <header className="header-app">
        <h1>MeuPlano.AI</h1>
        <p>Sistema Inteligente de Geração de Planos de Aula Pedagógicos</p>
      </header>

      {/* UX 2: Componente Indicador de Etapas */}
      <div className="indicador-etapas" aria-label="Progresso do formulário">
        <div className={`passo ${etapa >= 1 ? 'ativo' : ''}`}>1. Entrada de Dados</div>
        <div className="conector">➔</div>
        <div className={`passo ${etapa >= 2 ? 'ativo' : ''}`}>2. Revisão do Rascunho</div>
        <div className="conector">➔</div>
        <div className={`passo ${etapa === 3 ? 'ativo' : ''}`}>3. Relatório Emitido</div>
      </div>

      {/* UX 3: Exibição estruturada de Banner de Erros com role="alert" */}
      {erro && (
        <div className="banner-erro" role="alert">
          <strong>Atenção:</strong> {erro}
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL BASEADO NA ETAPA ATUAL */}
      <main className="painel-principal">
        {etapa === 1 && (
          <div className="secao-entrada">
            <label htmlFor="input-descricao">Descreva detalhadamente o tema e os objetivos da sua aula:</label>
            <textarea
              id="input-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Exemplo: Aula de história sobre a Revolução Industrial para o 9º ano com foco nos impactos sociais..."
              disabled={carregando}
            />
            {/* UX 1: Contador reativo de caracteres */}
            <div className="contador-caracteres">
              <span>Caracteres digitados: {descricao.length}</span>
              {descricao.length > 0 && !isDescricaoValida && (
                <span className="alerta-digitos"> (Digite pelo menos 10 caracteres para liberar)</span>
              )}
            </div>

            <button
              onClick={handleGerarPlano}
              disabled={carregando || !isDescricaoValida}
              className="botao-acao principal"
            >
              Gerar plano
            </button>
          </div>
        )}

        {etapa === 2 && rascunho && (
          <div className="secao-revisao">
            <h2>Rascunho Gerado: {rascunho.titulo}</h2>
            <div className="caixa-texto-preview">{rascunho.plano}</div>
            
            <div className="grupo-botoes">
              <button onClick={handleMelhorarPlano} disabled={carregando} className="botao-acao">
                Melhorar plano
              </button>
              <button onClick={handleGerarVersaoFinal} disabled={carregando} className="botao-acao principal">
                Gerar versão final
              </button>
              <button onClick={handleNovoPlano} disabled={carregando} className="botao-acao secundario">
                Novo plano
              </button>
            </div>
          </div>
        )}

        {etapa === 3 && versaoFinal && (
          <div className="secao-final">
            <h2>{versaoFinal.titulo} — Documentação Finalizada</h2>
            
            <h3>Estrutura do Plano</h3>
            <div className="caixa-texto-preview">{versaoFinal.plano}</div>

            <h3>Relatório Técnico de Emissão</h3>
            <div className="caixa-texto-preview relatorio">{versaoFinal.relatorio}</div>

            <div className="grupo-botoes">
              <button onClick={handleCopiarTexto} className="botao-acao utilitario">
                {copiado ? "✓ Copiado com Sucesso!" : "Copiar conteúdo do plano"}
              </button>
              <button onClick={handleNovoPlano} className="botao-acao principal">
                Novo plano
              </button>
            </div>
          </div>
        )}

        {/* UX 3: Feedback Visual de Carregamento Claro e Animado */}
        {carregando && (
          <div className="overlay-carregamento" role="status" aria-live="polite">
            <div className="elemento-spinner"></div>
            <p>Processando dados junto ao motor de IA... Aguarde um instante.</p>
          </div>
        )}
      </main>
    </div>
  );
}