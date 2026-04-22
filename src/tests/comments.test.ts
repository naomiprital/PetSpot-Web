import mongoose from 'mongoose';
import request from 'supertest';
import { getLogedInUser, UserData } from './utils';
import app from '../../index';

let loginUser: UserData;
const commentData = {
  _id: undefined,
  commentText: 'Test comment',
  postId: '697e36b697787eb1b24bc3cc',
  sender: '',
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.DATABASE_URL as string);
  }
  loginUser = await getLogedInUser(app);
  commentData.sender = loginUser._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Comments API Tests', () => {
  test('Get Comments - should retrieve all comments', async () => {
    const response = await request(app).get('/comment');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Create Comment - should create a new comment with valid token', async () => {
    const response = await request(app)
      .post('/comment')
      .set('Authorization', 'Bearer ' + loginUser.token)
      .send(commentData);
    commentData._id = response.body._id;

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.commentText).toBe(commentData.commentText);
    expect(response.body.sender).toBe(loginUser._id);
  });

  test('Create Comment - should be denied with invalid token', async () => {
    const response = await request(app)
      .post('/comment')
      .set('Authorization', 'Bearer ' + loginUser.token + 'junk')
      .send(commentData);
    expect(response.statusCode).toBe(401);
  });

  test('Get Comment by ID - should retrieve a specific comment', async () => {
    if (!commentData._id) {
      const createResponse = await request(app)
        .post('/comment')
        .set('Authorization', 'Bearer ' + loginUser.token)
        .send(commentData);
      commentData._id = createResponse.body._id;
    }

    const response = await request(app)
      .get('/comment/' + commentData._id)
      .set('Authorization', 'Bearer ' + loginUser.token);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentData._id);
    expect(response.body.commentText).toBe(commentData.commentText);
    expect(response.body.sender).toBe(commentData.sender);
  });

  test('Get Comments by Post ID - should retrieve comments for a specific post', async () => {
    const response = await request(app)
      .get('/comment?postId=' + commentData.postId)
      .set('Authorization', 'Bearer ' + loginUser.token);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Update Comment - should update a comment with valid token', async () => {
    const updatedText = 'Updated test comment';
    if (!commentData._id) {
      const createResponse = await request(app)
        .post('/comment')
        .set('Authorization', 'Bearer ' + loginUser.token)
        .send(commentData);
      commentData._id = createResponse.body._id;
    }

    const response = await request(app)
      .put('/comment/' + commentData._id)
      .set('Authorization', 'Bearer ' + loginUser.token)
      .send({ commentText: updatedText });
    expect(response.statusCode).toBe(200);
    expect(response.body.commentText).toBe(updatedText);
  });

  test('Delete Comment - should delete a comment with valid token', async () => {
    if (!commentData._id) {
      const createResponse = await request(app)
        .post('/comment')
        .set('Authorization', 'Bearer ' + loginUser.token)
        .send(commentData);
      commentData._id = createResponse.body._id;
    }

    const response = await request(app)
      .delete('/comment/' + commentData._id)
      .set('Authorization', 'Bearer ' + loginUser.token);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Comment deleted successfully');
  });
});
