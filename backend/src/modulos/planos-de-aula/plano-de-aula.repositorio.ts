import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface que define a estrutura de dados de um plano de aula persistido no MongoDB.
 */
export interface IPlanoDeAula extends Document {
  titulo: string;
  plano: string;
  relatorio: string;
  criadoEm: Date;
}

/**
 * Esquema estrutural do Mongoose para validação e persistência do documento de Plano de Aula.
 */
const PlanoDeAulaSchema: Schema = new Schema({
  titulo: { type: String, required: true },
  plano: { type: String, required: true },
  relatorio: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
});

const PlanoDeAulaModelo = mongoose.model<IPlanoDeAula>('PlanoDeAula', PlanoDeAulaSchema);

/**
 * Repositório dedicado para operações de persistência e acesso a dados de planos de aula.
 * Mantém o controlador e os serviços isolados das especificidades do driver do banco de dados.
 */
export class PlanoDeAulaRepositorio {
  /**
   * Grava de forma persistente um novo plano de aula finalizado na coleção do banco de dados.
   * * @param dados Contendo as strings estruturadas de titulo, plano e relatorio extraídos da IA.
   */
  async salvar(dados: { titulo: string; plano: string; relatorio: string }): Promise<void> {
    const novoPlano = new PlanoDeAulaModelo(dados);
    await novoPlano.save();
  }
}