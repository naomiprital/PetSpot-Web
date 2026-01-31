import postsController from '@/controllers/postsController';
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';

const postsRouter = Router();

/**
 * @swagger
 * /posts:
 *  get:
 *    tags: [Posts]
 *    summary: Retrieve all posts
 *    description: Get a list of all posts
 *    responses:
 *      200:
 *        description: A list of posts
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Post'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            examples:
 *              message: "An unexpected error occurred"
 */
postsRouter.get('/', postsController.getPosts);

/**
 * @swagger
 * /posts/{id}:
 *  get:
 *    tags: [Posts]
 *    summary: Retrieve a single post
 *    description: Get a post by its ID
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the post to retrieve
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: A single post
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      400:
 *        description: Invalid request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            examples:
 *              message: "Invalid post ID"
 *      404:
 *        description: Post not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            examples:
 *              message: "Post not found"
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            examples:
 *              message: "An unexpected error occurred"
 */
postsRouter.get('/:id', postsController.getPostById);

/**
 * @swagger
 * /posts:
 *  post:
 *    tags: [Posts]
 *    summary: Create a new post
 *    description: Create a new post
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Post'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      201:
 *        description: Post created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      400:
 *        description: Invalid request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            examples:
 *              message: "Invalid post data"
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            examples:
 *              message: "An unexpected error occurred"
 */
postsRouter.post('/', authMiddleware, postsController.createPost);

/**
 * @swagger
 * /posts/{id}:
 *  put:
 *    tags: [Posts]
 *    summary: Update a post
 *    description: Update a post by its ID
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the post to update
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Post'
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Post updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      400:
 *        description: Invalid request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            examples:
 *              message: "Invalid post data"
 *      404:
 *        description: Post not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            examples:
 *              message: "Post not found"
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *            examples:
 *              message: "An unexpected error occurred"
 */
postsRouter.put('/:id', authMiddleware, postsController.updatePost);

export default postsRouter;
