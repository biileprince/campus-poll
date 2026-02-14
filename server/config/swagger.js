import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Campus Poll API',
    version: '1.0.0',
    description: 'A comprehensive polling platform API for campus communities',
    contact: {
      name: 'Team TypeTitan',
      email: 'support@campus-poll.com'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://campus-poll.onrender.com/api'
        : 'http://localhost:5000/api',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and account management'
    },
    {
      name: 'Polls',
      description: 'Poll creation, voting, and results'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

export const swaggerSpec = swaggerJSDoc(options);