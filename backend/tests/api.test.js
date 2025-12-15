const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Book = require('../models/Book');

let mongo;
let adminToken;
let userToken;
let bookId;
let reviewId;

jest.setTimeout(30000);

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.JWT_SECRET = 'testsecret';
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
});

describe('Auth and Books', () => {
  test('register admin and user', async () => {
    const adminRes = await request(app).post('/api/auth/register').send({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'admin' });
    adminToken = adminRes.body.token;
    expect(adminToken).toBeDefined();
    const userRes = await request(app).post('/api/auth/register').send({ name: 'User', email: 'user@test.com', password: 'password' });
    userToken = userRes.body.token;
    expect(userToken).toBeDefined();
  });

  test('admin creates book', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Book 1', author: 'Author', genres: ['fiction'], synopsis: 'desc' });
    expect(res.statusCode).toBe(201);
    bookId = res.body.book._id;
  });

  test('list books with filter', async () => {
    const res = await request(app).get('/api/books').query({ author: 'Author', minRating: 0 });
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('Reading list and progress', () => {
  test('user adds to reading list', async () => {
    const res = await request(app)
      .post('/api/reading-list/add')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId, status: 'wantToRead' });
    expect(res.statusCode).toBe(201);
  });

  test('user updates progress', async () => {
    const res = await request(app)
      .put('/api/reading-list/update-progress')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId, progress: 50 });
    expect(res.statusCode).toBe(200);
    expect(res.body.entry.progress).toBe(50);
  });
});

describe('Reviews', () => {
  test('user creates review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ book: bookId, rating: 5, comment: 'Great' });
    expect(res.statusCode).toBe(201);
    reviewId = res.body.review._id;
  });

  test('user updates review', async () => {
    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 4 });
    expect(res.statusCode).toBe(200);
  });
});

describe('Admin actions', () => {
  test('admin bans user', async () => {
    const target = await User.findOne({ email: 'user@test.com' });
    const res = await request(app)
      .post(`/api/admin/ban/${target._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });
});
