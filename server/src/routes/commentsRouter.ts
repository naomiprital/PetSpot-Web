import commentsController from '@/controllers/commentsController';
import authMiddleware from '@/middlewares/authMiddleware';
import { Router } from 'express';

const commentsRouter = Router();

commentsRouter.get('/', commentsController.getComments);
commentsRouter.get('/:id', commentsController.getCommentById);
commentsRouter.post('/', authMiddleware, commentsController.createComment);
commentsRouter.put('/:id', authMiddleware, commentsController.updateComment);
commentsRouter.delete('/:id', authMiddleware, commentsController.deleteComment);

export default commentsRouter;
