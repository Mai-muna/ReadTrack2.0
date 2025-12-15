const User = require('../models/User');
const Review = require('../models/Review');
const Report = require('../models/Report');

async function recalcBookRatings(bookId) {
  const stats = await Review.aggregate([
    { $match: { book: bookId } },
    { $group: { _id: '$book', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length) {
    const { avgRating, count } = stats[0];
    await Review.db.model('Book').findByIdAndUpdate(bookId, { ratingsAverage: avgRating, ratingsCount: count });
  } else {
    await Review.db.model('Book').findByIdAndUpdate(bookId, { ratingsAverage: 0, ratingsCount: 0 });
  }
}

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isBanned: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User banned', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isBanned: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unbanned', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await Review.findByIdAndDelete(id);
    await recalcBookRatings(review.book);
    res.json({ message: 'Review removed by admin' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const duplicate = await Report.findOne({ reporter: req.user.id, review: id, status: 'open' });
    if (duplicate) return res.status(400).json({ message: 'You already reported this review' });
    const report = await Report.create({ reporter: req.user.id, review: id, reason });
    res.status(201).json({ message: 'Report submitted', report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report resolved', report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.listReports = async (_req, res) => {
  try {
    const reports = await Report.find().populate('review');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
exports.banUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, { isBanned: true }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User banned', user });
};

exports.unbanUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, { isBanned: false }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User unbanned', user });
};

exports.removeReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  await Review.findByIdAndDelete(id);
  res.json({ message: 'Review removed by admin' });
};

exports.reportReview = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'Reason required' });
  const report = await Report.create({ reporter: req.user.id, review: id, reason });
  res.status(201).json({ message: 'Report submitted', report });
};

exports.resolveReport = async (req, res) => {
  const { id } = req.params;
  const report = await Report.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json({ message: 'Report resolved', report });
};

exports.listReports = async (_req, res) => {
  const reports = await Report.find().populate('review');
  res.json(reports);
};
