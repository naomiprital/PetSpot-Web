import express from 'express';
import postsRouter from './postsRouter';
import commentsRouter from './commentsRouter';
import authRouter from './authRouter';
import userRouter from './userRouter';

const router = express.Router();

router.use('/post', postsRouter);

router.use('/comment', commentsRouter);

router.use('/auth', authRouter);

router.use('/user', userRouter);

export default router;
