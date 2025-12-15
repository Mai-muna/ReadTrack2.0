const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  genres: [{ type: String }],
  synopsis: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  ratingsAverage: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 }

});

module.exports = mongoose.model('Book', bookSchema);
