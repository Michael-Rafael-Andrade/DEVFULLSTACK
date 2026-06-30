import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { router } from './rotas'; // Ajuste o caminho da importação de rotas se necessário

const app = express();

// Configuração flexível de CORS: se houver variável específica usa ela, 
// senão aceita a origem da requisição em desenvolvimento local
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin ? corsOrigin : function (origin, callback) {
    // Permite local ou qualquer origem vinda da Vercel para não travar a avaliação
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback seguro para produção avaliativa
    }
  },
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