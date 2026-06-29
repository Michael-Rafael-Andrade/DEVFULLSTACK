import { config } from './config/env';

import app from './app';

import { setupSwagger } from './config/swagger';

setupSwagger(app);

app.listen(config.port, ()=>{
    console.log(`Servidor executando em ${config.urlApi} (ambiente: ${config.nodeEnv})`);
    console.log(`Documentação da API disponível em ${config.urlApi}/docs`);
});