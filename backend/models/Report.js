const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
