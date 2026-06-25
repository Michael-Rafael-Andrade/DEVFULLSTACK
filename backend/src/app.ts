import express from 'express';

import {Request, Response} from 'express';

const app = express();

app.use(express.json());

app.get('/' , (req: Request, res: Response) => {
    return res.json({
        mensagem: 'Hello World! API MeuPlano.AI funcionando.'
    });
});

export default app;