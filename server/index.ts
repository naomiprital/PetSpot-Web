import { Request, Response } from 'express';
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/connect';
import router from '@/routes/router';
import { swaggerSpec, swaggerUi } from '@/swagger';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.dev';
dotenv.config({ path: envFile });
const app = express();
const port = process.env.PORT || 8080;

connectDB();

app.use(express.json());

// Swagger UI setup
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Movies & Comments API Documentation',
  })
);

app.use('/', router);

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
