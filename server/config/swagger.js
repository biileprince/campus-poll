import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Campus Poll API',
        version: '2.0.0',
        description: `
## Overview
Campus Poll is a polling platform for campus communities. Create polls with single-choice, multiple-choice, or open-ended questions, share them via unique links, and view live results.

## Authentication
Most endpoints are public. Creating polls works without authentication, but signing in lets you manage and edit your polls later.

Use the **Bearer** scheme with a JWT token obtained from \`/auth/login\` or \`/auth/google\`.

## Rate Limits
- **Poll creation**: 10 requests per 15 minutes
- **Voting**: 30 votes per 15 minutes per IP
- **Results**: 60 requests per minute
- **Authentication**: 10 attempts per 15 minutes
        `,
        contact: {
            name: 'Team TypeTitan',
            email: 'support@campus-poll.com'
        },
        license: {
            name: 'ISC',
        }
    },
    servers: [
        {
            url: 'https://campus-poll.onrender.com/api',
            description: 'Production server'
        },
        {
            url: 'http://localhost:8000/api',
            description: 'Local development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token from /auth/login or /auth/google'
            }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Something went wrong' }
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'clx1234567890' },
                    email: { type: 'string', example: 'student@campus.edu' },
                    name: { type: 'string', nullable: true, example: 'John Doe' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Poll: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    question: { type: 'string', example: 'What is your favorite subject?' },
                    voteId: { type: 'string', description: 'Unique ID for the voting link' },
                    resultsId: { type: 'string', description: 'Unique ID for the results link' },
                    createdAt: { type: 'string', format: 'date-time' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    allowMultiple: { type: 'boolean' },
                    isExpired: { type: 'boolean' },
                    isMultiQuestion: { type: 'boolean' },
                    totalVotes: { type: 'integer' },
                    options: { type: 'array', items: { $ref: '#/components/schemas/Option' } },
                    questions: { type: 'array', items: { $ref: '#/components/schemas/Question' } },
                    creator: {
                        type: 'object',
                        nullable: true,
                        properties: { name: { type: 'string' } }
                    }
                }
            },
            Option: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    text: { type: 'string', example: 'Mathematics' },
                    voteCount: { type: 'integer', example: 5 }
                }
            },
            Question: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    text: { type: 'string', example: 'What do you think about the cafeteria?' },
                    type: { type: 'string', enum: ['single', 'multiple', 'open_ended'] },
                    order: { type: 'integer' },
                    options: { type: 'array', items: { $ref: '#/components/schemas/Option' } }
                }
            },
            CreatePollRequest: {
                type: 'object',
                required: ['question'],
                properties: {
                    question: { type: 'string', minLength: 5, example: "What's your favorite programming language?" },
                    options: {
                        type: 'array', minItems: 2, maxItems: 10,
                        items: { type: 'string' },
                        description: 'For single-question polls (legacy format)',
                        example: ['JavaScript', 'Python', 'Java']
                    },
                    questions: {
                        type: 'array',
                        description: 'For multi-question polls',
                        items: {
                            type: 'object',
                            properties: {
                                text: { type: 'string', example: 'Pick your favorite' },
                                type: { type: 'string', enum: ['single', 'multiple', 'open_ended'] },
                                options: { type: 'array', items: { type: 'string' } }
                            }
                        }
                    },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    allowMultiple: { type: 'boolean', default: false }
                }
            },
            PaginatedPolls: {
                type: 'object',
                properties: {
                    polls: { type: 'array', items: { $ref: '#/components/schemas/Poll' } },
                    total: { type: 'integer' },
                    pagination: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer' },
                            limit: { type: 'integer' },
                            total: { type: 'integer' },
                            totalPages: { type: 'integer' },
                            hasNext: { type: 'boolean' },
                            hasPrev: { type: 'boolean' }
                        }
                    }
                }
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                        type: 'object',
                        properties: {
                            user: { $ref: '#/components/schemas/User' },
                            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
                        }
                    }
                }
            }
        }
    },
    tags: [
        { name: 'Authentication', description: 'Register, login, Google OAuth, and account management' },
        { name: 'Polls', description: 'Create, browse, vote, and view poll results' },
        { name: 'Responses', description: 'Submit text responses for open-ended questions' }
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