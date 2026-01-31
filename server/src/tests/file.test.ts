import request from 'supertest';
import app from '../../index';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

jest.setTimeout(30000);

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DATABASE_URL as string);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('File Upload System', () => {
  test('Should upload a file and return a valid URL', async () => {
    const testFilePath = path.join(__dirname, 'test-image.png');

    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    fs.writeFileSync(testFilePath, pngHeader);

    try {
      const response = await request(app)
        .post('/file')
        .attach('file', testFilePath);

      expect(response.statusCode).toBe(200);
      expect(response.body.url).toMatch(/\.png$/);

      console.log('Successfully uploaded PNG:', response.body.url);
    } finally {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    }
  });
});
