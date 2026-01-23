import postsController from '@/controllers/postsController';
import { Router } from 'express';

const postsRouter = Router();

postsRouter.get('/', postsController.getPosts);
postsRouter.post('/', postsController.createPost);
postsRouter.get('/:id', postsController.getPostById);
postsRouter.patch('/:id', postsController.updatePost);

export default postsRouter;
