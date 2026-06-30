import mongoose, { Schema, Document } from 'mongoose';

export interface IPlanoDeAula extends Document {
  titulo: string;
  plano: string;
  relatorio: string;
  criadoEm?: Date;
}

const PlanoDeAulaSchema: Schema = new Schema(
  {
    titulo: { type: String, required: true },
    plano: { type: String, required: true },
    relatorio: { type: String, required: true },
  },
  { 
    timestamps: { createdAt: 'criadoEm', updatedAt: false }, 
    versionKey: false 
  }
);

// Padrão condicional para evitar re-compilação em testes no Mongoose
const PlanoDeAulaModelo = mongoose.models.PlanoDeAula || mongoose.model<IPlanoDeAula>('PlanoDeAula', PlanoDeAulaSchema);

export class PlanoDeAulaRepositorio {
  private async conectar(): Promise<void> {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error('A variável de ambiente MONGO_URL não foi definida.');
    }
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUrl);
    }
  }

  async salvar(dados: { titulo: string; plano: string; relatorio: string }): Promise<void> {
    await this.conectar();
    const novoPlano = new PlanoDeAulaModelo(dados);
    await novoPlano.save();
  }
}