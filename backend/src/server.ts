import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { router } from './rotas'; // Ajuste o caminho da importação de rotas se necessário

const app = express();

// Configura o CORS dinamicamente para aceitar conexões locais ou da URL em produção na Vercel
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json());
app.use(router);

// Inicialização segura e condicional do Banco de Dados MongoDB
const mongoUrl = process.env.MONGO_URL;
if (mongoUrl) {
  mongoose.connect(mongoUrl)
    .then(() => console.log("✓ Mongoose conectado com sucesso à instância do MongoDB."))
    .catch((erro) => console.error("Falha inicial na conexão do banco de dados:", erro.message));
} else {
  console.log("Executando sem banco de dados configurado (Variável MONGO_URL ausente).");
}

// Configuração de porta dinâmica injetada automaticamente pelo Render ou fallback local (3333)
const porta = process.env.PORT || 3333;
app.listen(porta, () => {
  console.log(`✓ Servidor escutando dinamicamente na porta ${porta}`);
});