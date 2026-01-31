import request from 'supertest';
import app from '../../index';
import mongoose from 'mongoose';
import UserModel from '../models/userModel';

let userAToken = '';
let userAId = '';
let userBId = '';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGODB_URI || (process.env.DATABASE_URL as string)
    );
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
      username: 'Victim User',
    });
    userAId = resA.body._id;

    const resB = await request(app).post('/auth/register').send({
      email: 'hacker@test.com',
      password: 'password123',
      username: 'Hacker User',
    });
    userBId = resB.body._id;

    const loginA = await request(app).post('/auth/login').send({
      email: 'victim@test.com',
      password: 'password123',
    });

    userAToken = loginA.body.token;
  });

  test('GET /user/:id - should return user profile', async () => {
    const response = await request(app).get(`/user/${userAId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe('Victim User');
    expect(response.body.email).toBe('victim@test.com');
    expect(response.body.password).toBeUndefined();
  });

  test('PUT /user/:id - should allow user to update their OWN profile', async () => {
    const response = await request(app)
      .put(`/user/${userAId}`)
      .set('Authorization', 'Bearer ' + userAToken)
      .send({
        username: 'Updated Name',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe('Updated Name');
  });

  test('PUT /user/:id - should BLOCK a hacker from updating someone else', async () => {
    const loginB = await request(app).post('/auth/login').send({
      email: 'hacker@test.com',
      password: 'password123',
    });
    const hackerToken = loginB.body.token;

    const response = await request(app)
      .put(`/user/${userAId}`)
      .set('Authorization', 'Bearer ' + hackerToken)
      .send({
        username: 'HACKED BY BOB',
      });

    expect(response.statusCode).toBe(403);

    const userA = await UserModel.findById(userAId);
    expect(userA?.username).toBe('Victim User');
  });
});
