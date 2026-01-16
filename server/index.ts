import { Request, Response } from 'express';
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/connect';
import router from '@/routes/router';

dotenv.config({ path: '.env.dev' });

const app = express();
const port = process.env.PORT || 8080;

connectDB();

app.use(express.json());

app.use('/', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
