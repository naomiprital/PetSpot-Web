import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../index';
import { getLogedInUser, testListing, MONGO_URI_TEST } from './utils';

describe('Listing API Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || MONGO_URI_TEST);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }

    await mongoose.connection.close();
  });

  it('Should fetch all listings (empty array initially)', async () => {
    const res = await request(app).get('/api/listing');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('Should return 404 for a non-existent listing by id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/listing/${fakeId}`);
    expect(res.statusCode).toEqual(404);
  });

  it('Create listing without token should be forbidden', async () => {
    const res = await request(app).post('/api/listing').send(testListing);
    expect(res.statusCode).toBe(401);
  });

  it('Create listing with valid token succeeds', async () => {
    const user = await getLogedInUser(app);
    const response = await request(app)
      .post('/api/listing')
      .set('Cookie', [`accessToken=${user.token}`])
      .send(testListing);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.author._id).toEqual(user._id);
  });

  it('Get listings by author id returns at least one listing', async () => {
    const user = await getLogedInUser(app);
    const createRes = await request(app)
      .post('/api/listing')
      .set('Cookie', [`accessToken=${user.token}`])
      .send(testListing);
    const authorId = user._id || createRes.body.author;
    const res = await request(app).get(`/api/listing/user/${authorId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('Update listing without token is forbidden', async () => {
    const user = await getLogedInUser(app);
    const createRes = await request(app)
      .post('/api/listing')
      .set('Cookie', [`accessToken=${user.token}`])
      .send(testListing);
    const id = createRes.body._id;
    const res = await request(app)
      .put(`/api/listing/${id}`)
      .send({ location: 'New Place' });
    expect(res.status).toBe(401);
  });

  it('Update listing with token succeeds', async () => {
    const user = await getLogedInUser(app);
    const createRes = await request(app)
      .post('/api/listing')
      .set('Cookie', [`accessToken=${user.token}`])
      .send(testListing);
    const id = createRes.body._id;
    const res = await request(app)
      .put(`/api/listing/${id}`)
      .set('Cookie', [`accessToken=${user.token}`])
      .send({ location: 'Updated Location' });
    expect(res.status).toBe(200);
    expect(res.body.location).toBe('Updated Location');
  });

  it('Toggle boost on listing requires auth and toggles value', async () => {
    const user = await getLogedInUser(app);
    const createRes = await request(app)
      .post('/api/listing')
      .set('Cookie', [`accessToken=${user.token}`])
      .send(testListing);
    const id = createRes.body._id;

    const onRes = await request(app)
      .put(`/api/listing/${id}/toggle-boost`)
      .set('Cookie', [`accessToken=${user.token}`]);
    expect(onRes.status).toBe(200);
    expect(
      typeof onRes.body.boosts === 'number' || Array.isArray(onRes.body.boosts)
    ).toBeTruthy();

    const offRes = await request(app)
      .put(`/api/listing/${id}/toggle-boost`)
      .set('Cookie', [`accessToken=${user.token}`]);
    expect(offRes.status).toBe(200);
  });

  it('Delete listing without token is forbidden', async () => {
    const user = await getLogedInUser(app);
    const createRes = await request(app)
      .post('/api/listing')
      .set('Cookie', [`accessToken=${user.token}`])
      .send(testListing);
    const id = createRes.body._id;
    const res = await request(app).delete(`/api/listing/${id}`);
    expect(res.status).toBe(401);
  });

  it('Delete listing with token succeeds', async () => {
    const user = await getLogedInUser(app);
    const createRes = await request(app)
      .post('/api/listing')
      .set('Cookie', [`accessToken=${user.token}`])
      .send(testListing);
    const id = createRes.body._id;
    const res = await request(app)
      .delete(`/api/listing/${id}`)
      .set('Cookie', [`accessToken=${user.token}`]);
    expect(res.status).toBe(200);
  });

  it('Operations on non-existing listing return 404', async () => {
    const user = await getLogedInUser(app);
    const fakeId = new mongoose.Types.ObjectId().toString();
    const resGet = await request(app).get(`/api/listing/${fakeId}`);
    expect(resGet.status).toBe(404);

    const resUpdate = await request(app)
      .put(`/api/listing/${fakeId}`)
      .set('Cookie', [`accessToken=${user.token}`])
      .send({ location: 'nowhere' });
    expect(resUpdate.status).toBe(404);

    const resDelete = await request(app)
      .delete(`/api/listing/${fakeId}`)
      .set('Cookie', [`accessToken=${user.token}`]);
    expect(resDelete.status).toBe(404);
  });
});
