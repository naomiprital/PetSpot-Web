import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ANIMAL_TYPES, LISTING_TYPES } from './types/listing';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PetSpot REST API',
      version: '1.0.0',
      description:
        'A REST API for managing PetSpot app, including AI-powered lost pet search.',
      contact: {
        name: 'PetSpot Team',
        email: 'PetSpot@gmail.com',
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SmartSearchRequest: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string', example: 'large golden dog with spots' },
            type: {
              type: 'string',
              enum: ['all', 'lost', 'found'],
              default: 'all',
            },
            animal: {
              type: 'string',
              enum: ['all', 'dog', 'cat', 'bird', 'other'],
              default: 'all',
            },
          },
        },
        AISuggestionResponse: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              example: 'A small white terrier with brown patches.',
            },
            animalType: { type: 'string', example: 'dog' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phoneNumber: { type: 'string' },
            imageUrl: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            listingId: { type: 'string' },
            commentText: { type: 'string' },
            author: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Listing: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            listingType: { type: 'string', enum: LISTING_TYPES },
            animalType: { type: 'string', enum: ANIMAL_TYPES },
            imageUrl: { type: 'string' },
            location: { type: 'string' },
            lastSeen: { type: 'number' },
            description: { type: 'string' },
            author: { $ref: '#/components/schemas/User' },
            comments: {
              type: 'array',
              items: { $ref: '#/components/schemas/Comment' },
            },
            boosts: {
              type: 'array',
              items: { type: 'string' },
            },
            aiVisualTags: { type: 'string' },
            isResolved: { type: Boolean },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/ai/smart-search': {
        post: {
          summary: 'AI-powered listing search',
          tags: ['AI'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SmartSearchRequest' },
              },
            },
          },
          responses: {
            '200': { description: 'Ranked search results' },
          },
        },
      },
      '/api/ai/suggest-description': {
        post: {
          summary: 'Analyze image to suggest description and animal type',
          tags: ['AI'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'AI suggestions',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AISuggestionResponse' },
                },
              },
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          summary: 'Refresh access token',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
              },
            },
          },
          responses: {
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          summary: 'Logout user',
          tags: ['Auth'],
          responses: {
            '200': { description: 'Logged out successfully' },
          },
        },
      },
      '/api/auth/google': {
        post: {
          summary: 'Login with Google',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    credentials: {
                      type: 'object',
                      properties: {
                        credential: {
                          type: 'string',
                          description: 'Google JWT credential or access token',
                        },
                      },
                    },
                    phoneNumber: {
                      type: 'string',
                      description: "The user's phone number",
                      example: '0501234567',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Google login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
          },
        },
      },
      '/api/comment/{listingId}': {
        get: {
          summary: 'Get all comments for a specific listing',
          tags: ['Comments'],
          parameters: [
            {
              in: 'path',
              name: 'listingId',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'List of comments',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Comment' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Add a comment to a listing',
          tags: ['Comments'],
          parameters: [
            {
              in: 'path',
              name: 'listingId',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['authorId', 'commentText'],
                  properties: {
                    authorId: { type: 'string' },
                    commentText: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Comment created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Comment' },
                },
              },
            },
          },
        },
      },
      '/api/comment/{id}': {
        put: {
          summary: 'Update a specific comment',
          tags: ['Comments'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              description: 'The ID of the comment to update',
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['authorId', 'commentText'],
                  properties: {
                    authorId: {
                      type: 'string',
                      description: 'Used to verify ownership',
                    },
                    commentText: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Comment updated successfully' },
          },
        },
        delete: {
          summary: 'Delete a specific comment',
          tags: ['Comments'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              description: 'The ID of the comment to delete',
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['authorId', 'listingId'],
                  properties: {
                    authorId: {
                      type: 'string',
                      description: 'Used to verify ownership',
                    },
                    listingId: {
                      type: 'string',
                      description:
                        'The ID of the listing the comment belongs to',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Comment deleted successfully' },
          },
        },
      },
      '/api/listing': {
        get: {
          summary: 'Get all active pet listings',
          tags: ['Listings'],
          responses: {
            '200': {
              description: 'A list of listings',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Listing' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create a new pet listing',
          tags: ['Listings'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    authorId: { type: 'string' },
                    listingType: { type: 'string', enum: LISTING_TYPES },
                    animalType: { type: 'string', enum: ANIMAL_TYPES },
                    location: { type: 'string' },
                    description: { type: 'string' },
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Listing' },
                },
              },
            },
          },
        },
      },
      '/api/listing/user/{authorId}': {
        get: {
          summary: 'Get all listings created by a specific user',
          tags: ['Listings'],
          parameters: [
            {
              in: 'path',
              name: 'authorId',
              required: true,
              schema: { type: 'string' },
              description: 'The ID of the author',
            },
          ],
          responses: {
            '200': {
              description: "A list of the user's listings",
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Listing' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/listing/{id}': {
        get: {
          summary: 'Get a specific listing by ID',
          tags: ['Listings'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'The listing data' },
            '404': {
              description: 'Resource not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
        put: {
          summary: 'Update an existing listing',
          tags: ['Listings'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    authorId: { type: 'string' },
                    description: { type: 'string' },
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Updated successfully' },
          },
        },
        delete: {
          summary: 'Soft delete a listing',
          tags: ['Listings'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    authorId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Deleted successfully' },
          },
        },
      },
      '/api/listing/{id}/toggle-boost': {
        put: {
          summary: 'Boost a listing',
          tags: ['Listings'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId'],
                  properties: {
                    userId: {
                      type: 'string',
                      description: 'The ID of the user boosting the listing',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Listing boosted successfully' },
          },
        },
      },
      '/api/user/{id}': {
        get: {
          summary: 'Get user profile',
          tags: ['Users'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'User profile data' },
          },
        },
        put: {
          summary: 'Update user profile',
          tags: ['Users'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Profile updated' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);
export { specs, swaggerUi };
