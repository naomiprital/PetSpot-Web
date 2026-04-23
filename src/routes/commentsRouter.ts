import express from 'express';
import commentsController from '../controllers/commentsController';
import authMiddleware from '@/middlewares/authMiddleware';

const router = express.Router();

router.get('/:listingId', commentsController.getComments);
router.post('/:listingId', authMiddleware, commentsController.createComment);
router.put('/:id', authMiddleware, commentsController.updateComment);
router.delete('/:id', authMiddleware, commentsController.deleteComment);

export default router;
