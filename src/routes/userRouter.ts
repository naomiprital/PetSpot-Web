import express from 'express';
import userController from '../controllers/userController';
import upload from '../middlewares/upload';
import authMiddleware from '@/middlewares/authMiddleware';

const router = express.Router();

router.get('/:id', userController.getUser);

router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  userController.updateUser
);

export default router;
