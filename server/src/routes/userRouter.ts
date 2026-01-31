import { Router } from 'express';
import userController from '@/controllers/userController';
import authMiddleware from '@/middlewares/authMiddleware';

const userRouter = Router();

userRouter.get('/:id', userController.getUserById);

userRouter.put('/:id', authMiddleware, userController.updateUser);

export default userRouter;
