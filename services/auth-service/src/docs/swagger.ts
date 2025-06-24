import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication API documentation',
    },
  },
  apis: [
    './src/modules/**/*.ts',      // Controller, DTO 경로 주석 스캔
  ],
};

const swaggerSpec = swaggerJsdoc(options);
export { swaggerSpec,swaggerUi };