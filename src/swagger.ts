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
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
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
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            listingId: { type: 'string' },
            commentText: { type: 'string' },
            author: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
            lastSeen: {
              type: 'number',
              description: 'Unix timestamp of when the pet was last seen',
            },
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
            isDeleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
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
            '401': { description: 'Unauthorized' },
            '400': { description: 'Bad request' },
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
            '401': { description: 'Unauthorized' },
            '400': { description: 'Bad request' },
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
            '401': { description: 'Unauthorized' },
            '400': { description: 'Bad request' },
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
            '401': { description: 'Unauthorized' },
            '400': { description: 'Bad request' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          summary: 'Refresh access token',
          tags: ['Auth'],
          responses: {
            '200': {
              description: 'Access token refreshed successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          summary: 'Logout user',
          tags: ['Auth'],
          responses: {
            '200': { description: 'Logged out successfully' },
            '401': { description: 'Unauthorized' },
            '400': { description: 'Bad request' },
            '500': { description: 'Internal server error' },
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
            '401': { description: 'Unauthorized' },
            '400': { description: 'Bad request' },
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
            '401': { description: 'Unauthorized' },
            '404': { description: 'Listing not found' },
            '400': { description: 'Bad request' },
          },
        },
        post: {
          summary: 'Add a comment to a listing',
          security: [{ cookieAuth: [] }],
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
                  required: ['commentText'],
                  properties: {
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
            '401': { description: 'Unauthorized' },
            '404': { description: 'Listing not found' },
            '400': { description: 'Bad request' },
          },
        },
      },
      '/api/comment/{id}': {
        put: {
          security: [{ cookieAuth: [] }],
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
                  required: ['commentText'],
                  properties: {
                    commentText: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Comment updated successfully' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Comment not found' },
            '400': { description: 'Bad request' },
          },
        },
        delete: {
          security: [{ cookieAuth: [] }],
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
          responses: {
            '200': { description: 'Comment deleted successfully' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Comment not found' },
            '400': { description: 'Bad request' },
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
                    listingType: { type: 'string', enum: LISTING_TYPES },
                    animalType: { type: 'string', enum: ANIMAL_TYPES },
                    location: { type: 'string' },
                    lastSeen: {
                      type: 'number',
                      description:
                        'Unix timestamp of when the pet was last seen',
                    },
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
            '401': { description: 'Unauthorized' },
            '400': { description: 'Bad request' },
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
            '404': { description: 'Listing not found' },
            '401': { description: 'Unauthorized' },
            '400': { description: 'Bad request' },
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
          security: [{ cookieAuth: [] }],
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
                    listingType: { type: 'string', enum: LISTING_TYPES },
                    animalType: { type: 'string', enum: ANIMAL_TYPES },
                    location: { type: 'string' },
                    lastSeen: { type: 'number' },
                    description: { type: 'string' },
                    image: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Updated successfully' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Listing not found' },
            '400': { description: 'Bad request' },
          },
        },
        delete: {
          summary: 'Soft delete a listing',
          tags: ['Listings'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Deleted successfully' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Listing not found' },
            '400': { description: 'Bad request' },
          },
        },
      },
      '/api/listing/{id}/toggle-boost': {
        put: {
          summary: 'Toggle boost on a listing',
          tags: ['Listings'],
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Listing boosted successfully' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Listing not found' },
            '400': { description: 'Bad request' },
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
            '401': { description: 'Unauthorized' },
            '404': { description: 'User not found' },
            '400': { description: 'Bad request' },
          },
        },
        put: {
          summary: 'Update user profile',
          tags: ['Users'],
          security: [{ cookieAuth: [] }],
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
            '401': { description: 'Unauthorized' },
            '404': { description: 'User not found' },
            '400': { description: 'Bad request' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);
export { specs, swaggerUi };
