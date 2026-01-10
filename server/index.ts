import { Request, Response } from 'express';
import express from 'express';
import dotenv from 'dotenv';

const app = express();
dotenv.config({ path: '.env.dev' });

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
