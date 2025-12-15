require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const readingListRoutes = require('./routes/readingListRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const rateLimit = require("express-rate-limit");
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
app.use(express.json());
app.use(cors());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ Connection failed:', err.message));
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reading-list', readingListRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('ReadTrack API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
