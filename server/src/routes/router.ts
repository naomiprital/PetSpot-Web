import express from 'express';
import postsRouter from './postsRouter';

const router = express.Router();

router.use('/posts', postsRouter);

export default router;
