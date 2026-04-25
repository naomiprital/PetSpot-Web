import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/connect';
import router from '@/routes/router';
import { specs, swaggerUi } from '@/swagger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath =
  process.env.NODE_ENV === 'test'
    ? '.env.test'
    : process.env.NODE_ENV === 'development'
      ? '.env.dev'
      : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envPath) });

const app = express();

const initApp = (): Promise<Express> => {
  return new Promise<Express>(async (resolve, reject) => {
    try {
      app.use(express.json());
      app.use(express.urlencoded({ extended: false }));
      app.use(cookieParser());

      app.use(
        cors({
          origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
          credentials: true,
        })
      );

      const publicPath = path.join(__dirname, '..', 'public');
      app.use(express.static(publicPath));

      app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(specs, {
          explorer: true,
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: 'PetSpot API Documentation',
        })
      );

      app.use('/api', router);

      app.get(/.*/, (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
      });

      await connectDB();

      resolve(app);
    } catch (error) {
      reject(error);
    }
  });
};

export default initApp;
