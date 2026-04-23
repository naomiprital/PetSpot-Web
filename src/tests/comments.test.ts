import mongoose from 'mongoose';
import request from 'supertest';
import { getLogedInUser, testListing, UserData } from './utils';
import app from '../../index';

let loginUser: UserData;
let listingId: string;
const commentData = {
  _id: undefined,
  commentText: 'Test comment',
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DATABASE_URL as string);
  }
  loginUser = await getLogedInUser(app);

  const listingResponse = await request(app)
    .post('/listing')
    .set('Authorization', 'Bearer ' + loginUser.token)
    .send({ authorId: loginUser._id, ...testListing });
  listingId = listingResponse.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Comments API Tests', () => {
  test('Get Comments - should retrieve all comments for a listing', async () => {
    const response = await request(app).get(`/comment/${listingId}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Create Comment - should create a new comment with valid token', async () => {
    const response = await request(app)
      .post(`/comment/${listingId}`)
      .set('Authorization', 'Bearer ' + loginUser.token)
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
      .post(`/comment/${listingId}`)
      .set('Authorization', 'Bearer ' + loginUser.token + 'junk')
      .send({
        authorId: loginUser._id,
        commentText: commentData.commentText,
      });
    expect(response.statusCode).toBe(401);
  });

  test('Get Comment by ID - should retrieve a specific comment', async () => {
    if (!commentData._id) {
      const createResponse = await request(app)
        .post(`/comment/${listingId}`)
        .set('Authorization', 'Bearer ' + loginUser.token)
        .send({
          authorId: loginUser._id,
          commentText: commentData.commentText,
        });
      commentData._id = createResponse.body._id;
    }

    const response = await request(app).get(`/comment/${commentData._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentData._id);
    expect(response.body.commentText).toBe(commentData.commentText);
  });

  test('Update Comment - should update a comment with valid token', async () => {
    const updatedText = 'Updated test comment';
    if (!commentData._id) {
      const createResponse = await request(app)
        .post(`/comment/${listingId}`)
        .set('Authorization', 'Bearer ' + loginUser.token)
        .send({
          authorId: loginUser._id,
          commentText: commentData.commentText,
        });
      commentData._id = createResponse.body._id;
    }

    const response = await request(app)
      .put(`/comment/${commentData._id}`)
      .set('Authorization', 'Bearer ' + loginUser.token)
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
        .post(`/comment/${listingId}`)
        .set('Authorization', 'Bearer ' + loginUser.token)
        .send({
          authorId: loginUser._id,
          commentText: commentData.commentText,
        });
      commentData._id = createResponse.body._id;
    }

    const response = await request(app)
      .delete(`/comment/${commentData._id}`)
      .set('Authorization', 'Bearer ' + loginUser.token)
      .send({ listingId: listingId });
    expect(response.statusCode).toBe(200);
  });
});
