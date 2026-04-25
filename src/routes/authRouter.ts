import express from 'express';
import authController from '../controllers/authController';
import upload from '../middlewares/upload';

const router = express.Router();

router.post('/register', upload.single('image'), authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/google', authController.googleLogin);

export default router;
