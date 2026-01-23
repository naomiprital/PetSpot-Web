import express from 'express';
import postsRouter from './postsRouter';

const router = express.Router();

router.use('/post', postsRouter);

export default router;
