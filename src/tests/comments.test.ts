import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import { getLogedInUser, MONGO_URI_TEST, testListing, UserData } from './utils';
import { Express } from 'express';
import initApp from '..';

let loginUser: UserData;
let app: Express;
let listingId: string;

const commentData = {
  _id: undefined,
  commentText: 'Test comment',
};

beforeAll(async () => {
  app = await initApp();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || MONGO_URI_TEST);
  }
  
  loginUser = await getLogedInUser(app);
  const listingResponse = await request(app)
    .post('/api/listing')
    .set('Cookie', [`accessToken=${loginUser.token}`])
    .send({ authorId: loginUser._id, ...testListing });
  listingId = listingResponse.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Comments API Tests', () => {
  test('Get Comments - should retrieve all comments for a listing', async () => {
    const response = await request(app).get(`/api/comment/${listingId}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Create Comment - should create a new comment with valid token', async () => {
    const response = await request(app)
      .post(`/api/comment/${listingId}`)
      .set('Cookie', [`accessToken=${loginUser.token}`])
      .send({
        authorId: loginUser._id,
        commentText: commentData.commentText,
      });
    commentData._id = response.body._id;

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.commentText).toBe(commentData.commentText);
  });

  test('Create Comment - should be denied with invalid token', async () => {
    const response = await request(app)
      .post(`/api/comment/${listingId}`)
      .set('Cookie', [`accessToken=${loginUser.token}junk`])
      .send({
        authorId: loginUser._id,
        commentText: commentData.commentText,
      });
    expect(response.statusCode).toBe(401);
  });

  test('Update Comment - should update a comment with valid token', async () => {
    const updatedText = 'Updated test comment';
    if (!commentData._id) {
      const createResponse = await request(app)
        .post(`/api/comment/${listingId}`)
        .set('Cookie', [`accessToken=${loginUser.token}`])
        .send({
          authorId: loginUser._id,
          commentText: commentData.commentText,
        });
      commentData._id = createResponse.body._id;
    }

    const response = await request(app)
      .put(`/api/comment/${commentData._id}`)
      .set('Cookie', [`accessToken=${loginUser.token}`])
      .send({
        authorId: loginUser._id,
        commentText: updatedText,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.commentText).toBe(updatedText);
  });

  test('Delete Comment - should delete a comment with valid token', async () => {
    if (!commentData._id) {
      const createResponse = await request(app)
        .post(`/api/comment/${listingId}`)
        .set('Cookie', [`accessToken=${loginUser.token}`])
        .send({
          authorId: loginUser._id,
          commentText: commentData.commentText,
        });
      commentData._id = createResponse.body._id;
    }

    const response = await request(app)
      .delete(`/api/comment/${commentData._id}`)
      .set('Cookie', [`accessToken=${loginUser.token}`])
      .send({ listingId: listingId });
    expect(response.statusCode).toBe(200);
  });
});
