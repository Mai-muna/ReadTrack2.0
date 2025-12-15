require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected for seeding'))
  .catch(err => { console.error(err); process.exit(1); });

async function seed() {
  try {
    // 1️⃣ Delete old data (optional but recommended)
    await User.deleteMany({});
    await Book.deleteMany({});

    // 2️⃣ Create Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@readtrack.local',
      password: 'Admin@123',  // hashes automatically
      role: 'admin'
    });

    // 3️⃣ Add Books
    const books = await Book.insertMany([
      {
        title: 'Dune',
        author: 'Frank Herbert',
        genres: ['Sci-Fi'],
        synopsis: 'Epic sci-fi classic',
        createdBy: admin._id
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        genres: ['Romance'],
        synopsis: 'Classic novel',
        createdBy: admin._id
      }
    ]);

    console.log('🌱 Seed complete!', { admin, books });
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
