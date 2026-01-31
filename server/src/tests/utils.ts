import request from 'supertest';
import { Express } from 'express';
import { User } from '@/types/user';

export type UserData = {
  email: string;
  password: string;
  username: string;
  _id: string;
  token: string;
  refreshToken: string;
};

export const userData = {
  email: 'testuser@gmail.com',
  password: 'password123',
  username: 'TestUser',
  _id: '',
  token: '',
  refreshToken: '',
};

export const testPost = {
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

export const getLogedInUser = async (app: Express): Promise<UserData> => {
  const email = userData.email;
  const password = userData.password;
  const username = userData.username;
  let response = await request(app)
    .post('/auth/register')
    .send({ email: email, password: password, username: username });
  if (response.status !== 201) {
    response = await request(app)
      .post('/auth/login')
      .send({ email: email, password: password });
  }
  const logedUser = {
    _id: response.body._id,
    token: response.body.token,
    refreshToken: response.body.refreshToken,
    username: username,
    email: email,
    password: password,
  };
  return logedUser;
};
