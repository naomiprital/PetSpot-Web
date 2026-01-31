import mongoose from 'mongoose';
import request from 'supertest';
import { User } from '@/types/user';
import { getLogedInUser, testPost, UserData, userData } from './utils';
import app from '../../index';

let loginUser: UserData;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DATABASE_URL as string);
  }
  loginUser = await getLogedInUser(app);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Post API Tests', () => {
  test('Get Posts - should retrieve all posts', async () => {
    const response = await request(app).get('/post');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Create Post - should create a new post with valid token', async () => {
    const response = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + loginUser.token)
      .send(testPost);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.type).toBe(testPost.type);
    expect(response.body.sender).toBe(loginUser._id);
  });
});
