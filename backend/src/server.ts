import { config } from './config/env';

import app from './app';

app.listen(config.port, () => {
    console.log(`Servidor executando em ${config.urlApi} (ambiente: ${config.nodeEnv})`);
});
