import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Campus Poll API',
        version: '2.1.0',
        description: `
## Overview
Campus Poll is a polling platform for campus communities. Create polls with single-choice,
multiple-choice, or open-ended questions, share them via unique links, view live results, and
manage the platform from an admin panel.

## Authentication
Most read endpoints are public. Creating polls works without authentication, but signing in
lets you manage and edit your polls later. Admin endpoints require a user whose account
has \`role: "ADMIN"\`.

Use the **Bearer** scheme with a JWT token obtained from \`/auth/login\` or \`/auth/google\`.

## Poll formats
- **Single-question (legacy)** — \`POST /polls\` with \`{ question, options[] }\`. Options are
  attached to the poll directly.
- **Multi-question** — \`POST /polls\` with \`{ question, questions: [{ text, type, options[] }] }\`.
  Each question has its own type: \`single\`, \`multiple\`, or \`open_ended\`.

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
        license: { name: 'ISC' }
    },
    servers: [
        { url: 'https://campus-poll.onrender.com/api', description: 'Production server' },
        { url: 'http://localhost:5000/api', description: 'Local development server' }
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
            // === Common ===
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Something went wrong' },
                    message: { type: 'string', example: 'Something went wrong' }
                }
            },
            ValidationError: {
                type: 'object',
                properties: {
                    error: { type: 'string', example: 'Validation failed' },
                    details: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string', example: 'email' },
                                message: { type: 'string', example: 'Please provide a valid email' }
                            }
                        }
                    }
                }
            },
            Pagination: {
                type: 'object',
                properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 12 },
                    total: { type: 'integer', example: 87 },
                    totalPages: { type: 'integer', example: 8 },
                    hasNext: { type: 'boolean', example: true },
                    hasPrev: { type: 'boolean', example: false }
                }
            },

            // === User ===
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'clx1234567890' },
                    email: { type: 'string', format: 'email', example: 'student@campus.edu' },
                    name: { type: 'string', nullable: true, example: 'John Doe' },
                    role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            AdminUserListItem: {
                allOf: [
                    { $ref: '#/components/schemas/User' },
                    {
                        type: 'object',
                        properties: {
                            hasGoogleAuth: { type: 'boolean', example: false },
                            pollCount: { type: 'integer', example: 3 }
                        }
                    }
                ]
            },
            UserStats: {
                type: 'object',
                properties: {
                    pollsCreated: { type: 'integer', example: 5 },
                    totalResponses: { type: 'integer', example: 42 },
                    engagementRate: { type: 'integer', example: 80 }
                }
            },

            // === Poll ===
            Option: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    text: { type: 'string', example: 'Mathematics' },
                    voteCount: { type: 'integer', example: 5 },
                    percentage: { type: 'integer', example: 42, description: 'Only present on results responses' }
                }
            },
            Question: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    text: { type: 'string', example: 'How do you rate the cafeteria?' },
                    type: { type: 'string', enum: ['single', 'multiple', 'open_ended'] },
                    order: { type: 'integer', example: 0 },
                    options: { type: 'array', items: { $ref: '#/components/schemas/Option' } },
                    totalVotes: { type: 'integer', example: 12, description: 'Only present on results responses' },
                    responses: {
                        type: 'array',
                        description: 'Text responses (open_ended only, results endpoint)',
                        items: { $ref: '#/components/schemas/Response' }
                    }
                }
            },
            Response: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    text: { type: 'string', example: 'Improve the Wi-Fi in the library please.' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            PollListItem: {
                type: 'object',
                description: 'Summary shape returned by listing endpoints (/polls, /my-polls, /admin/polls)',
                properties: {
                    id: { type: 'string' },
                    question: { type: 'string' },
                    voteId: { type: 'string' },
                    resultsId: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    chartType: { type: 'string', example: 'pie' },
                    totalVotes: { type: 'integer', example: 24, description: 'Includes both choice votes and open-ended responses' },
                    optionCount: { type: 'integer', example: 4, description: 'For multi-question polls, sum across all questions' },
                    isMultiQuestion: { type: 'boolean', example: false },
                    questionCount: { type: 'integer', example: 0 },
                    hasOpenEnded: { type: 'boolean', example: false },
                    status: { type: 'string', enum: ['Active', 'Expired'] },
                    canEdit: { type: 'boolean', description: 'Only on /my-polls — true when poll has no votes yet' }
                }
            },
            Poll: {
                type: 'object',
                description: 'Voting view returned by GET /poll/{voteId}. Vote counts are hidden to avoid biasing voters.',
                properties: {
                    id: { type: 'string' },
                    question: { type: 'string' },
                    voteId: { type: 'string' },
                    resultsId: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    allowMultiple: { type: 'boolean' },
                    isExpired: { type: 'boolean' },
                    isMultiQuestion: { type: 'boolean' },
                    totalVotes: { type: 'integer' },
                    options: { type: 'array', items: { $ref: '#/components/schemas/Option' }, description: 'Legacy single-question polls' },
                    questions: { type: 'array', items: { $ref: '#/components/schemas/Question' }, description: 'Multi-question polls' },
                    creator: {
                        type: 'object',
                        nullable: true,
                        properties: { name: { type: 'string' } }
                    }
                }
            },
            PollResults: {
                type: 'object',
                description: 'Full results view returned by GET /results/{resultsId} — includes vote counts, percentages, and open-ended responses.',
                properties: {
                    id: { type: 'string' },
                    question: { type: 'string' },
                    totalVotes: { type: 'integer' },
                    status: { type: 'string', enum: ['Active', 'Expired', 'No votes yet'] },
                    chartType: { type: 'string' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    isMultiQuestion: { type: 'boolean' },
                    options: { type: 'array', items: { $ref: '#/components/schemas/Option' } },
                    questions: { type: 'array', items: { $ref: '#/components/schemas/Question' } }
                }
            },
            CreatePollRequest: {
                type: 'object',
                required: ['question'],
                description: 'Send either `options[]` (single-question) **or** `questions[]` (multi-question), not both.',
                properties: {
                    question: { type: 'string', minLength: 5, example: "What's your favorite programming language?" },
                    options: {
                        type: 'array', minItems: 2, maxItems: 10,
                        items: { type: 'string' },
                        description: 'For single-question polls (legacy format)',
                        example: ['JavaScript', 'Python', 'Java']
                    },
                    questions: {
                        type: 'array', minItems: 1, maxItems: 10,
                        description: 'For multi-question polls',
                        items: {
                            type: 'object',
                            required: ['text', 'type'],
                            properties: {
                                text: { type: 'string', minLength: 3, example: 'Pick your favorite' },
                                type: { type: 'string', enum: ['single', 'multiple', 'open_ended'] },
                                options: {
                                    type: 'array', minItems: 2, maxItems: 10,
                                    items: { type: 'string' },
                                    description: 'Required for single/multiple questions; ignored for open_ended'
                                }
                            }
                        }
                    },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    chartType: { type: 'string', example: 'pie', default: 'pie' },
                    allowMultiple: { type: 'boolean', default: false, description: 'Legacy single-question polls only' }
                }
            },
            CreatePollResponse: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    voteId: { type: 'string' },
                    resultsId: { type: 'string' },
                    votingUrl: { type: 'string', example: '/poll/abc123' },
                    resultsUrl: { type: 'string', example: '/results/xyz789' }
                }
            },
            UpdatePollRequest: {
                type: 'object',
                description: 'Provide `options[]` for legacy polls or `questions[]` for multi-question polls. If the poll already has votes, only `expiresAt` and `chartType` can be changed.',
                properties: {
                    question: { type: 'string', minLength: 5 },
                    options: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 10 },
                    questions: { type: 'array', items: { $ref: '#/components/schemas/CreatePollRequest/properties/questions/items' } },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    chartType: { type: 'string' }
                }
            },
            VoteRequest: {
                type: 'object',
                required: ['voteId'],
                properties: {
                    voteId: { type: 'string', description: "The poll's voting ID (verifies the option belongs to this poll)" }
                }
            },
            VoteResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Vote recorded successfully' },
                    voteCount: { type: 'integer', example: 6 }
                }
            },
            SubmitResponseRequest: {
                type: 'object',
                required: ['text'],
                properties: {
                    text: { type: 'string', maxLength: 1000, example: 'I think the library needs longer opening hours.' },
                    voteId: { type: 'string', description: "Optional — included by the client for context" }
                }
            },

            // === Listings ===
            PaginatedPolls: {
                type: 'object',
                properties: {
                    polls: { type: 'array', items: { $ref: '#/components/schemas/PollListItem' } },
                    total: { type: 'integer' },
                    pagination: { $ref: '#/components/schemas/Pagination' }
                }
            },
            AdminPaginatedUsers: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                        type: 'object',
                        properties: {
                            users: { type: 'array', items: { $ref: '#/components/schemas/AdminUserListItem' } },
                            pagination: { $ref: '#/components/schemas/Pagination' }
                        }
                    }
                }
            },
            AdminPaginatedPolls: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                        type: 'object',
                        properties: {
                            polls: {
                                type: 'array',
                                items: {
                                    allOf: [
                                        { $ref: '#/components/schemas/PollListItem' },
                                        {
                                            type: 'object',
                                            properties: {
                                                creator: {
                                                    type: 'object',
                                                    nullable: true,
                                                    properties: {
                                                        id: { type: 'string' },
                                                        email: { type: 'string' },
                                                        name: { type: 'string', nullable: true },
                                                        role: { type: 'string', enum: ['USER', 'ADMIN'] }
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            pagination: { $ref: '#/components/schemas/Pagination' }
                        }
                    }
                }
            },
            AdminStats: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                        type: 'object',
                        properties: {
                            totalUsers: { type: 'integer', example: 124 },
                            totalPolls: { type: 'integer', example: 87 },
                            totalVotes: { type: 'integer', example: 1542, description: 'Sum of all choice votes plus all open-ended responses' },
                            activePolls: { type: 'integer', example: 35 },
                            expiredPolls: { type: 'integer', example: 52 },
                            recentUsers: { type: 'integer', example: 8, description: 'Users created in the last 7 days' },
                            recentPolls: { type: 'integer', example: 12, description: 'Polls created in the last 7 days' }
                        }
                    }
                }
            },

            // === Auth ===
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
            },
            GoogleAuthRequest: {
                type: 'object',
                required: ['credential'],
                properties: {
                    credential: { type: 'string', description: 'Google ID token returned by GIS / FedCM', example: 'eyJhbGciOi...' }
                }
            }
        }
    },
    tags: [
        { name: 'Authentication', description: 'Register, login, Google OAuth, and account management' },
        { name: 'Polls', description: 'Create, browse, vote, and view poll results' },
        { name: 'Responses', description: 'Submit text responses for open-ended questions' },
        { name: 'Admin', description: 'Platform management endpoints. Require an authenticated user with role ADMIN.' }
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
