import request from 'supertest';
import app from '../index';
import mongoose from 'mongoose';
import User from '../models/userModel';
import { testPost, userData } from './utils';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DATABASE_URL as string);
  }
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  test('POST /listing - should be denied without token', async () => {
    const response = await request(app).post('/listing').send(testPost);
    expect(response.statusCode).toBe(401);
  });

  test('POST /auth/register - should register new user', async () => {
    const response = await request(app).post('/auth/register').send({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('_id');
    userData._id = response.body._id;
  });

  test('POST /auth/login - should return tokens', async () => {
    const response = await request(app).post('/auth/login').send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('_id');

    userData.token = response.body.accessToken;
    userData.refreshToken = response.body.refreshToken;
  });

  test('Test Token Expiration & Refresh', async () => {
    await new Promise(r => setTimeout(r, 6000));

    const failResponse = await request(app)
      .post('/listing')
      .set('Authorization', 'Bearer ' + userData.token)
      .send({ authorId: userData._id, ...testPost });
    expect(failResponse.statusCode).toBe(401);
    const refreshResponse = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: userData.refreshToken });

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.body).toHaveProperty('accessToken');
    expect(refreshResponse.body).toHaveProperty('refreshToken');

    userData.token = refreshResponse.body.accessToken;
    userData.refreshToken = refreshResponse.body.refreshToken;

    const successResponse = await request(app)
      .post('/listing')
      .set('Authorization', 'Bearer ' + userData.token)
      .send({ authorId: userData._id, ...testPost });
    expect(successResponse.statusCode).not.toBe(401);
  }, 10000);

  test('POST /auth/logout - should logout', async () => {
    const response = await request(app).post('/auth/logout').send({
      refreshToken: userData.refreshToken,
    });
    expect(response.statusCode).toBe(200);
  });

  test('POST /auth/refresh - should block reused token', async () => {
    const response = await request(app).post('/auth/refresh').send({
      refreshToken: userData.refreshToken,
    });
    expect(response.statusCode).toBe(403);
  });
});
