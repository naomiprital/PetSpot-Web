import express from 'express';
import aiController from '../controllers/aiController';
import upload from '../middlewares/upload';

const router = express.Router();

router.post('/smart-search', aiController.smartSearch);

router.post(
  '/suggest-description',
  upload.single('image'),
  aiController.suggestDescription
);

export default router;
