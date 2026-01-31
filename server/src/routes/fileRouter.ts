import { Router } from 'express';
import multer from 'multer';
import fileController from '@/controllers/fileController';
import fs from 'fs';
const uploadDir = './public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const fileRouter = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').filter(Boolean).slice(1).join('.');
    cb(null, Date.now() + '.' + ext);
  },
});

const upload = multer({ storage: storage });
fileRouter.post('/', upload.single('file'), fileController.uploadFile);

export default fileRouter;
