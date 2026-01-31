import { Request, Response } from 'express';
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/connect';
import router from '@/routes/router';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.dev';
dotenv.config({ path: envFile });
const app = express();
const port = process.env.PORT || 8080;

connectDB();

app.use(express.json());

app.use('/', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
