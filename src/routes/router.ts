import express from 'express';
import commentsRouter from './commentsRouter';
import authRouter from './authRouter';
import userRouter from './userRouter';
import aiRouter from './aiRouter';
import listingRouter from './listingRouter';

const router = express.Router();

router.use('/listing', listingRouter);

router.use('/comment', commentsRouter);

router.use('/auth', authRouter);

router.use('/user', userRouter);

router.use('/ai', aiRouter);

export default router;
