import express from 'express';
import postsRouter from './postsRouter';
import commentsRouter from './commentsRouter';

const router = express.Router();

router.use('/posts', postsRouter);

router.use('/comments', commentsRouter);

export default router;
