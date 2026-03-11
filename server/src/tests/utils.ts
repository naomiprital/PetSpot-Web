import request from 'supertest';
import { Express } from 'express';

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

export const testPost = {
  _id: undefined,
  sender: 'testuser',
  type: 'lost',
  animalType: 'dog',
  location: {
    type: 'Point',
    coordinates: [34.7818, 32.0853],
  },
  dateTimeOccured: new Date(),
  description: 'A lost dog in the city',
  photos: ['http://example.com/photo1.jpg'],
  isResolved: false,
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
  const userPhoto = response.body.photo;
  response = await request(app)
    .post('/auth/login')
    .send({ email: email, password: password });

  const logedUser = {
    _id: response.body._id,
    token: response.body.token,
    refreshToken: response.body.refreshToken,
    email: email,
    password: password,
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phoneNumber,
    photo: userPhoto,
  };
  return logedUser;
};
