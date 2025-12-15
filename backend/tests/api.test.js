process.env.NODE_ENV = 'test';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const candidateBinaries = [
  process.env.MONGOMS_SYSTEM_BINARY,
  '/tmp/mongobin/bin/mongod',
  '/tmp/mongobin/bin/bin/mongod',
  '/tmp/mongobin/mongodb-linux-x86_64-ubuntu2204-7.0.5/bin/mongod'
].filter(Boolean);

const findExistingBinary = () => candidateBinaries.find((bin) => fs.existsSync(bin));

const ensureMongoBinary = () => {
  const existing = findExistingBinary();
  if (existing) {
    process.env.MONGOMS_SYSTEM_BINARY = existing;
    return;
  }

  try {
    const downloadUrl = process.env.MONGOMS_DOWNLOAD_URL ||
      'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.5.tgz';
    const tarballPath = '/tmp/mongobin/mongo.tgz';
    const extractRoot = '/tmp/mongobin';
    fs.mkdirSync(extractRoot, { recursive: true });
    execSync(`curl --fail --silent --show-error -L -o ${tarballPath} ${downloadUrl}`, { stdio: 'inherit' });
    execSync(`tar -xzf ${tarballPath} -C ${extractRoot}`, { stdio: 'inherit' });
    const postDownload = findExistingBinary();
    if (postDownload) {
      process.env.MONGOMS_SYSTEM_BINARY = postDownload;
    }
  } catch (error) {
    console.warn('Failed to prepare MongoDB binary, mongodb-memory-server will attempt download.', error);
    delete process.env.MONGOMS_SYSTEM_BINARY;
  }
};

ensureMongoBinary();

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
  const binary = process.env.MONGOMS_SYSTEM_BINARY
    ? { systemBinary: process.env.MONGOMS_SYSTEM_BINARY }
    : { version: process.env.MONGOMS_VERSION || '7.0.5' };

  mongo = await MongoMemoryServer.create({ binary });
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

describe('Export summary', () => {
  test('returns text export for reading list', async () => {
    const res = await request(app)
      .get('/api/export/reading-summary')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ format: 'text' });
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Book 1/);
  });

  test('rejects invalid format', async () => {
    const res = await request(app)
      .get('/api/export/reading-summary')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ format: 'docx' });
    expect(res.statusCode).toBe(400);
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

  test('admin removes review and book rating recalculates', async () => {
    const res = await request(app)
      .delete(`/api/admin/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    const book = await Book.findById(bookId);
    expect(book.ratingsCount).toBe(0);
    expect(book.ratingsAverage).toBe(0);
  });
});
