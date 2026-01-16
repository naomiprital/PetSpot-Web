import postsController from '@/controllers/postsController';
import { Router } from 'express';

const postsRouter = Router();

postsRouter.get('/', postsController.getPosts);
postsRouter.post('/', postsController.createPost);

// todo: postsRouter.get('/:id', postController.getPostById);
// todo: postsRouter.put('/:id', postController.updatePost);
// todo: postsRouter.delete('/:id', postController.deletePost);

export default postsRouter;
