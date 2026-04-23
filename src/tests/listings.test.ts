import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import listingRoutes from '../routes/listingRouter';

const app = express();
app.use(express.json());
app.use('/api/listings', listingRoutes);

describe('Listing API Tests', () => {
  // Before all tests, connect to a test database
  beforeAll(async () => {
    const url =
      process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/petspot_test';
    await mongoose.connect(url);
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should fetch all listings', async () => {
    const res = await request(app).get('/api/listings');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should return 404 for a non-existent listing', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/listings/${fakeId}`);
    expect(res.statusCode).toEqual(404);
  });
});
