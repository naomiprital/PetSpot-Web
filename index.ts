import { Request, Response } from 'express';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/connect';
import router from '@/routes/router';
import { specs, swaggerUi } from '@/swagger';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.dev';
dotenv.config({ path: envFile });
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173', // todo: when we have profuction add the prod url
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 8080;

connectDB();

app.use(express.json());

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PetSpot API Documentation',
  })
);

app.get('/api-docs.json', (_, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

app.use('/api', router);

if (process.env.NODE_ENV !== 'test') {
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
