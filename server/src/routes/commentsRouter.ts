import commentsController from '@/controllers/commentsController';
import { Router } from 'express';

const commentsRouter = Router();

commentsRouter.get('/', commentsController.getComments.bind(commentsController));
commentsRouter.post('/', commentsController.createComment.bind(commentsController));
// todo: commentsRouter.get('/:id', commentsController.getCommentById.bind(commentsController));
// todo: commentsRouter.put('/:id', commentsController.updateComment.bind(commentsController));
// todo: commentsRouter.delete('/:id', commentsController.deleteComment.bind(commentsController));

export default commentsRouter;
