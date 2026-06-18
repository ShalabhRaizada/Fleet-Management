import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fleet Management System API',
      version: '1.0.0',
      description: 'REST API for the Fleet Management System (Phase 1 core entities).',
    },
    servers: [{ url: '/api', description: 'Base API path' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, 'routes', '*.ts'), path.join(__dirname, 'routes', '*.js')],
};

export const openapiSpec = swaggerJsdoc(options);
