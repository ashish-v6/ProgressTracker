import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Progress Tracker REST API Documentation',
      version: '1.0.0',
      description: 'Production-ready, type-safe REST API for the Progress Tracker Application',
      contact: {
        name: 'Engineering Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Access JWT token to access protected endpoints.'
        }
      }
    }
  },
  // Parse comments in both development ts files and compiled dist folder js files
  apis: ['./src/routes/*.ts', './src/routes/*.js', './dist/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
