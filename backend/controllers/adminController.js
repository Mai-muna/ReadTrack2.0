const User = require('../models/User');
const Review = require('../models/Review');
const Report = require('../models/Report');

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
