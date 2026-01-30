import commentsController from '@/controllers/commentsController';
import { Router } from 'express';

const commentsRouter = Router();

commentsRouter.get('/', commentsController.getComments.bind(commentsController));
commentsRouter.post('/', commentsController.createComment.bind(commentsController));
commentsRouter.get('/:id', commentsController.getCommentById.bind(commentsController));
commentsRouter.get('/post/:postId', commentsController.getCommentsByPostId.bind(commentsController));
commentsRouter.patch('/:id', commentsController.updateComment.bind(commentsController));
commentsRouter.delete('/:id', commentsController.deleteComment.bind(commentsController));

export default commentsRouter;
