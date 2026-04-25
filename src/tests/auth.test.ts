import { jest, test, expect, describe, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import initApp from '../index';
import mongoose from 'mongoose';
import User from '../models/userModel';
import { testListing, userData, MONGO_URI_TEST } from './utils';

let app: Express;

beforeAll(async () => {
  app = await initApp();
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || MONGO_URI_TEST);
  }
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  test('POST /api/listing - should be denied without token', async () => {
    const response = await request(app)
      .post('/api/listing')
      .send({ ...testListing });
    expect(response.statusCode).toBe(401);
  });

  test('POST /api/auth/register - should register new user', async () => {
    const response = await request(app).post('/api/auth/register').send({
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

  test('POST /api/auth/login - should return tokens', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.statusCode).toBe(200);

    const rawSet = response.headers['set-cookie'];
    const setCookies = Array.isArray(rawSet) ? rawSet : rawSet ? [rawSet] : [];
    const hasAccess = setCookies.some(cookie =>
      cookie.startsWith('accessToken=')
    );
    const hasRefresh = setCookies.some(cookie =>
      cookie.startsWith('refreshToken=')
    );

    expect(hasAccess).toBe(true);
    expect(hasRefresh).toBe(true);
    expect(response.body).toHaveProperty('_id');

    const accessCookie = setCookies.find(cookie =>
      cookie.startsWith('accessToken=')
    );
    const refreshCookie = setCookies.find(cookie =>
      cookie.startsWith('refreshToken=')
    );
    userData.token = accessCookie
      ? accessCookie.split(';')[0].split('=')[1]
      : '';
    userData.refreshToken = refreshCookie
      ? refreshCookie.split(';')[0].split('=')[1]
      : '';
  });

  test('Test Token Expiration & Refresh', async () => {
    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${userData.refreshToken}`]);

    expect(refreshResponse.statusCode).toBe(200);

    const rawSet2 = refreshResponse.headers['set-cookie'];
    const setCookies2 = Array.isArray(rawSet2)
      ? rawSet2
      : rawSet2
        ? [rawSet2]
        : [];
    const accessCookie2 = setCookies2.find(cookie =>
      cookie.startsWith('accessToken=')
    );
    const refreshCookie2 = setCookies2.find(cookie =>
      cookie.startsWith('refreshToken=')
    );
    expect(accessCookie2).toBeDefined();
    expect(refreshCookie2).toBeDefined();

    userData.token = accessCookie2
      ? accessCookie2.split(';')[0].split('=')[1]
      : '';
    userData.refreshToken = refreshCookie2
      ? refreshCookie2.split(';')[0].split('=')[1]
      : '';

    const successResponse = await request(app)
      .post('/api/listing')
      .set('Cookie', [`accessToken=${userData.token}`])
      .send({ authorId: userData._id, ...testListing });
    expect(successResponse.statusCode).toBe(201);
  }, 10000);

  test('POST /api/auth/logout - should logout', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`refreshToken=${userData.refreshToken}`]);
    expect(response.statusCode).toBe(200);
  });

  test('POST /api/auth/google - should create or login user via Google', async () => {
    const { OAuth2Client } = await import('google-auth-library');
    jest
      .spyOn(OAuth2Client.prototype as any, 'verifyIdToken')
      .mockImplementation(async () => ({
        getPayload: () => ({
          email: 'googleuser@example.com',
          given_name: 'Google',
          family_name: 'User',
        }),
      }));

    const response = await request(app)
      .post('/api/auth/google')
      .send({ credentials: { credential: 'fake-token' }, phoneNumber: '000' });

    expect(response.statusCode).toBe(200);
    const rawSet = response.headers['set-cookie'];
    const setCookies = Array.isArray(rawSet) ? rawSet : rawSet ? [rawSet] : [];
    const hasAccess = setCookies.some(c => c.startsWith('accessToken='));
    const hasRefresh = setCookies.some(c => c.startsWith('refreshToken='));
    expect(hasAccess).toBe(true);
    expect(hasRefresh).toBe(true);
    expect(response.body).toHaveProperty('_id');
  });

  test('POST /api/auth/refresh - should block reused token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${userData.refreshToken}`]);
    expect(response.statusCode).toBe(403);
  });
});
