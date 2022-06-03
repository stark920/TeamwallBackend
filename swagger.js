const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js'];
const doc = {
  info: {
    title: 'MetaWall API',
    version: '1.0.0',
    description: 'this is api document',
  },
  host: 'localhost:3005',
  schemes: ['http', 'https'],
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'headers',
      name: 'authorization',
      description: '請加上 API Token',
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc);
