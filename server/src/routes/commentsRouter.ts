import commentsController from '@/controllers/commentsController';
import authMiddleware from '@/middlewares/authMiddleware';
import { Router } from 'express';

const commentsRouter = Router();

/**
 * @swagger
 * /components:
 *   get:
 *     tags: [Comments]
 *     summary: Retrieve all comments
 *     description: Get a list of all comments
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               message: "An unexpected error occurred"
 */
commentsRouter.get('/', commentsController.getComments);

/**
 * @swagger
 * /components/{id}:
 *   get:
 *     tags: [Comments]
 *     summary: Retrieve a single comment
 *     description: Get a comment by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the comment to retrieve
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A single comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               message: "Invalid comment ID"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               message: "Unauthorized access"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               message: "Comment not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               message: "An unexpected error occurred"
 */
commentsRouter.get('/:id', commentsController.getCommentById);
commentsRouter.post('/', authMiddleware, commentsController.createComment);
commentsRouter.put('/:id', authMiddleware, commentsController.updateComment);
commentsRouter.delete('/:id', authMiddleware, commentsController.deleteComment);

export default commentsRouter;
