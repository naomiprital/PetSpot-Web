import commentsController from '@/controllers/commentsController';
import { Router } from 'express';

const commentsRouter = Router();

commentsRouter.get('/', commentsController.getComments);
commentsRouter.post('/', commentsController.createComment);
commentsRouter.get('/:id', commentsController.getCommentById);
// todo: commentsRouter.put('/:id', commentsController.updateComment);
// todo: commentsRouter.delete('/:id', commentsController.deleteComment);
export default commentsRouter;
