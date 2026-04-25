import request from 'supertest';
import app from '../../index';
import mongoose from 'mongoose';
import UserModel from '../models/userModel';
import { MONGO_URI_TEST } from './utils';

let userAToken = '';
let userAId = '';
let userBId = '';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || MONGO_URI_TEST);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User API & Security', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});

    const resA = await request(app).post('/auth/register').send({
      email: 'victim@test.com',
      password: 'password123',
      firstName: 'Victim',
      lastName: 'User',
      phoneNumber: '1234567890',
      photo: 'https://example.com/victim.jpg',
    });
    userAId = resA.body._id;

    const resB = await request(app).post('/auth/register').send({
      email: 'hacker@test.com',
      password: 'password123',
      firstName: 'Hacker',
      lastName: 'User',
      phoneNumber: '0987654321',
    });
    userBId = resB.body._id;

    const loginA = await request(app).post('/auth/login').send({
      email: 'victim@test.com',
      password: 'password123',
    });
    const setCookiesA = loginA.headers['set-cookie'];
    const cookiesA = Array.isArray(setCookiesA)
      ? setCookiesA
      : setCookiesA
        ? [setCookiesA]
        : [];
    const accessA = cookiesA.find((c: string) => c.startsWith('accessToken='));
    userAToken = accessA ? accessA.split(';')[0].split('=')[1] : '';
  });

  test('GET /user/:id - should return user profile', async () => {
    const response = await request(app).get(`/user/${userAId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe('Victim');
    expect(response.body.lastName).toBe('User');
    expect(response.body.email).toBe('victim@test.com');
    expect(response.body.password).toBeUndefined();
  });

  test('PUT /user/:id - should allow user to update their OWN profile', async () => {
    const response = await request(app)
      .put(`/user/${userAId}`)
      .set('Cookie', [`accessToken=${userAToken}`])
      .send({
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '9876543210',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe('Updated');
    expect(response.body.lastName).toBe('Name');
    expect(response.body.phoneNumber).toBe('9876543210');
  });

  test('PUT /user/:id - should BLOCK a hacker from updating someone else', async () => {
    const loginB = await request(app).post('/auth/login').send({
      email: 'hacker@test.com',
      password: 'password123',
    });
    const setCookiesB = loginB.headers['set-cookie'];
    const cookiesB = Array.isArray(setCookiesB)
      ? setCookiesB
      : setCookiesB
        ? [setCookiesB]
        : [];
    const accessB = cookiesB.find((c: string) => c.startsWith('accessToken='));
    const hackerToken = accessB ? accessB.split(';')[0].split('=')[1] : '';

    const response = await request(app)
      .put(`/user/${userAId}`)
      .set('Cookie', [`accessToken=${hackerToken}`])
      .send({
        firstName: 'Hacked',
        lastName: 'Hacker',
        phoneNumber: '0000000000',
      });

    expect(response.statusCode).toBe(403);

    const userA = await UserModel.findById(userAId);
    expect(userA?.firstName).toBe('Victim');
    expect(userA?.lastName).toBe('User');
    expect(userA?.phoneNumber).toBe('1234567890');
  });
});
