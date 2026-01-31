import postsController from '@/controllers/postsController';
import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';

const postsRouter = Router();

postsRouter.get('/', postsController.getPosts);
postsRouter.get('/:id', postsController.getPostById);
postsRouter.post('/', authMiddleware, postsController.createPost);
postsRouter.put('/:id', authMiddleware, postsController.updatePost);

export default postsRouter;
