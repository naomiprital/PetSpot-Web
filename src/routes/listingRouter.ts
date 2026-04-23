import express from 'express';
import listingsController from '../controllers/listingsController';
import upload from '../middlewares/upload';
import authMiddleware from '@/middlewares/authMiddleware';

const router = express.Router();

router.get('/', listingsController.getAllListings);
router.get('/user/:authorId', listingsController.getUserListings);
router.get('/:id', listingsController.getListing);

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  listingsController.createListing
);
router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  listingsController.updateListing
);
router.delete('/:id', authMiddleware, listingsController.deleteListing);
router.put(
  '/:id/toggle-boost',
  authMiddleware,
  listingsController.toggleBoostListing
);

export default router;
