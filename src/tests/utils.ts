import { Express } from 'express';
import request from 'supertest';

export const MONGO_URI_TEST = 'mongodb://localhost:27017/petspot-test';

// Ensure aiService is mocked during tests to avoid external API calls/log noise
jest.mock('../../src/services/aiService', () => ({
  generateHiddenTags: async (_: string) => 'mocked-tags',
}));

export type UserData = {
  _id: string;
  email: string;
  password: string;
  token: string;
  refreshToken: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  photo?: string;
};

export const userData: UserData = {
  _id: '',
  email: 'testuser@gmail.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '1234567890',
  token: '',
  refreshToken: '',
};

export const testListing = {
  listingType: 'lost',
  animalType: 'dog',
  location: 'Tel Aviv, Israel',
  lastSeen: Date.now(),
  description: 'A lost dog in the city',
  imageUrl: 'http://example.com/photo1.jpg',
};

export const getLogedInUser = async (app: Express): Promise<UserData> => {
  const email = userData.email;
  const password = userData.password;
  const firstName = userData.firstName;
  const lastName = userData.lastName;
  const phoneNumber = userData.phoneNumber;

  let response = await request(app).post('/auth/register').send({
    email: email,
    password: password,
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phoneNumber,
  });

  const userPhoto = response.body.imageUrl;

  response = await request(app)
    .post('/auth/login')
    .send({ email: email, password: password });

  const rawSet = response.headers['set-cookie'];
  const setCookies = Array.isArray(rawSet) ? rawSet : rawSet ? [rawSet] : [];
  const accessCookie = setCookies.find(cookie =>
    cookie.startsWith('accessToken=')
  );
  const refreshCookie = setCookies.find(cookie =>
    cookie.startsWith('refreshToken=')
  );
  const accessToken = accessCookie
    ? accessCookie.split(';')[0].split('=')[1]
    : '';
  const refreshToken = refreshCookie
    ? refreshCookie.split(';')[0].split('=')[1]
    : '';

  const logedUser = {
    _id: response.body._id,
    token: accessToken,
    refreshToken: refreshToken,
    email: email,
    password: password,
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phoneNumber,
    photo: userPhoto,
  };
  return logedUser;
};
