import e from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PetSpot REST API',
      version: '1.0.0',
      description:
        'A REST API for managing PetSpot app, including posts, comments and user authentication.',
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
          description: 'JWT authorization header using the Bearer scheme',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            _id: {
              type: 'string',
              description: 'User unique identifier',
              example: '507f1f77bcf86cd799439011',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            username: {
              type: 'string',
              description: 'User username',
              example: 'petlover123',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (hashed when stored)',
              example: 'password123',
            },
          },
        },
        Post: {
          type: 'object',
          required: [
            'sender',
            'type',
            'animalType',
            'description',
            'location',
            'dateTimeOccured',
          ],
          properties: {
            _id: {
              type: 'string',
              description: 'Post unique identifier',
              example: '507f1f77bcf86cd799439011',
            },
            sender: {
              type: 'string',
              description: 'ID of the user who created this post',
              example: '507f1f77bcf86cd799439011',
            },
            animalType: {
              type: 'string',
              enum: [
                'dog',
                'cat',
                'bird',
                'rabbit',
                'hamster',
                'horse',
                'other',
              ],
              description: 'Type of animal',
              example: 'dog',
            },
            location: {
              type: 'object',
              required: ['type', 'coordinates'],
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point'],
                  description: 'GeoJSON type',
                  example: 'Point',
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number',
                  },
                  minItems: 2,
                  maxItems: 2,
                  description: 'GeoJSON coordinates',
                  example: [102.0, 0.5],
                },
                address: {
                  type: 'string',
                  description: 'Human-readable address',
                  example: '123 Pet Street, Pet City, PC 12345',
                },
              },
            },
            type: {
              type: 'string',
              enum: ['lost', 'found'],
              description: 'Type of the post',
              example: 'found',
            },
            dateTimeOccured: {
              type: 'date-time',
              format: 'date-time',
              description: 'Date and time when the event occurred',
              example: '2023-03-15T14:30:00Z',
            },
            description: {
              type: 'string',
              description: 'Description of the post',
              example: 'White cat found near the park.',
            },
            photos: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
                description: 'URL of the photo',
                example: 'https://example.com/photo.jpg',
              },
            },
            isResolved: {
              type: 'boolean',
              description: 'Indicates if the post has been resolved',
              example: false,
            },
          },
        },
        Comment: {
          type: 'object',
          required: ['commentText', 'postId', 'sender'],
          properties: {
            _id: {
              type: 'string',
              description: 'Comment unique identifier',
              example: '507f1f77bcf86cd799439011',
            },
            commentText: {
              type: 'string',
              description: 'Comment content',
              example: 'Adorable!',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            postId: {
              type: 'string',
              description: 'ID of the post this comment belongs to',
              example: '507f1f77bcf86cd799439011',
            },
            sender: {
              type: 'string',
              description: 'ID of the user who wrote this comment',
              example: '507f1f77bcf86cd799439011',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              example: 'password123',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'username'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123',
            },
            username: {
              type: 'string',
              example: 'petlover123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Valid refresh token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'An error occurred',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Validation error message',
              example: 'Validation failed: Email is required',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'missing or invalid token',
              },
            },
          },
        },
        NotFoundError: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Data not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
              example: {
                error: 'Validation failed: ...',
              },
            },
          },
        },
        ConflictError: {
          description: 'Conflict error (e.g. duplicate key)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Unique constraint error',
                  },
                  keys: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    example: ['email'],
                  },
                },
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Something went wrong, please try again later',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
