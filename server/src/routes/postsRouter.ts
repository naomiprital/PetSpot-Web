import postsController from '@/controllers/postsController';
import { Router } from 'express';

const postsRouter = Router();

postsRouter.get('/', postsController.getPosts.bind(postsController));
postsRouter.post('/', postsController.createPost.bind(postsController));
postsRouter.get('/:id', postsController.getPostById.bind(postsController));
postsRouter.put('/:id', postsController.updatePost.bind(postsController));

export default postsRouter;
