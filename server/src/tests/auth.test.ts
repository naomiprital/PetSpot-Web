import request from 'supertest';
import app from '../../index';
import mongoose from 'mongoose';
import User from '../models/userModel';

const userData = {
  email: 'testuser@gmail.com',
  password: 'password123',
  username: 'TestUser',
  _id: '',
  token: '',
  refreshToken: '',
};

const testPost = {
  title: 'Test Post',
  content: 'This is a test content',
  animalType: 'dog',
  type: 'lost',
  dateTimeOccured: new Date(),
  location: {
    type: 'Point',
    coordinates: [34.7818, 32.0853],
  },
  sender: '12345',
};

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
  test('POST /post - should be denied without token', async () => {
    const response = await request(app).post('/post').send(testPost);
    expect(response.statusCode).toBe(401);
  });

  test('POST /auth/register - should register new user', async () => {
    const response = await request(app).post('/auth/register').send({
      email: userData.email,
      password: userData.password,
      username: userData.username,
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
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('_id');

    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
  });

  test('POST /post - should be allowed with valid token', async () => {
    const response = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + userData.token)
      .send(testPost);

    expect(response.statusCode).not.toBe(401);
  });

  test('POST /post - should be denied with invalid token', async () => {
    const response = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + userData.token + 'junk')
      .send(testPost);

    expect(response.statusCode).toBe(401);
  });

  test('Test Token Expiration & Refresh', async () => {
    await new Promise(r => setTimeout(r, 6000));

    const failResponse = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + userData.token)
      .send(testPost);
    expect(failResponse.statusCode).toBe(401);

    const refreshResponse = await request(app)
      .post('/auth/refresh-token')
      .send({
        refreshToken: userData.refreshToken,
      });

    expect(refreshResponse.statusCode).toBe(200);
    expect(refreshResponse.body).toHaveProperty('token');
    expect(refreshResponse.body).toHaveProperty('refreshToken');

    userData.token = refreshResponse.body.token;
    userData.refreshToken = refreshResponse.body.refreshToken;

    const successResponse = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + userData.token)
      .send(testPost);
    expect(successResponse.statusCode).not.toBe(401);
  }, 10000);

  test('POST /auth/logout - should logout', async () => {
    const response = await request(app).post('/auth/logout').send({
      refreshToken: userData.refreshToken,
    });
    expect(response.statusCode).toBe(200);
  });

  test('POST /auth/refresh-token - should block reused token', async () => {
    const response = await request(app).post('/auth/refresh-token').send({
      refreshToken: userData.refreshToken,
    });
    expect(response.statusCode).toBe(401);
  });
});
