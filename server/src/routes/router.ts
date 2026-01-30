import express from 'express';
import postsRouter from './postsRouter';
import commentsRouter from './commentsRouter';

const router = express.Router();

router.use('/post', postsRouter);

router.use('/comment', commentsRouter);

export default router;
