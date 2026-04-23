import express from 'express';
import listingsController from '../controllers/listingsController';
import upload from '../middlewares/upload';

const router = express.Router();

router.get('/', listingsController.getAllListings);
router.post('/', upload.single('image'), listingsController.createListing);
router.get('/user/:authorId', listingsController.getUserListings);
router.get('/:id', listingsController.getListing);
router.put('/:id', upload.single('image'), listingsController.updateListing);
router.delete('/:id', listingsController.deleteListing);
router.put('/:id/boost', listingsController.boostListing);

export default router;
