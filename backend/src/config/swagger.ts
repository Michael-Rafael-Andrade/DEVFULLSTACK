import swaggerUi from 'swagger-ui-express';

import SwaggerParser from '@apidevtools/swagger-parser';

import { Express } from 'express';

import { config } from './env';

export const setupSwagger = async (app: Express) => {
    const spec = await SwaggerParser.dereference('./docs/openapi.yaml') as any;

    spec.servers = [
        {
            url: config.urlApi,
            description: `Servidor ${config.nodeEnv}`
        }
    ]

    app.use('/docs' , swaggerUi.serve, swaggerUi.setup(spec));
};
