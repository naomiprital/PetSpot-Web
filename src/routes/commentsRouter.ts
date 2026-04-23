import express from 'express';
import commentsController from '../controllers/commentsController';

const router = express.Router();

router.get('/:listingId', commentsController.getComments);
router.post('/:listingId', commentsController.createComment);
router.put('/:id', commentsController.updateComment);
router.delete('/:id', commentsController.deleteComment);

export default router;
