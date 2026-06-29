import express from 'express';

import {Request, Response} from 'express';

import { planoDeAulaRotas } from './modulos/planos-de-aula/plano-de-aula.rotas';

import cors from 'cors';

import { config } from './config/env';

const app = express();

// Habilita o CORS antes das rotas (origem vinda de config.corsOrigin).
app.use(cors({ origin: config.corsOrigin }));

app.use(express.json());

app.get('/' , (req: Request, res: Response) => {
    return res.json({
        mensagem: 'Hello World! API MeuPlano.AI funcionando.'
    });
});

app.use('/planos-de-aula' , planoDeAulaRotas);

export default app;