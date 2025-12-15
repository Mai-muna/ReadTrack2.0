require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');
const Review = require('./models/Review');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await User.findOne({ role: 'admin' });
  const book = await Book.findOne();
  if (!admin || !book) {
    console.log('Please ensure admin and book exist');
    process.exit(0);
  }
  await Review.create({ book: book._id, user: admin._id, rating: 5, title: 'Great', comment: 'Excellent book.' });
  await mongoose.disconnect();
  console.log('Seed reviews done');
}
main().catch(e => console.error(e));
