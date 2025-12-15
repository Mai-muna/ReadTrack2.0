const User = require('../models/User');
const Notification = require('../models/Notification');
const Review = require('../models/Review');

exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id) return res.status(400).json({ message: 'Cannot follow yourself' });
    const user = await User.findById(req.user.id);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (user.following.includes(targetId)) return res.status(400).json({ message: 'Already following' });

    user.following.push(targetId);
    target.followers.push(user.id);
    await user.save();
    await target.save();

    await Notification.create({
      user: targetId,
      type: 'follow',
      message: `${user.name} started following you`,
    });

    res.json({ message: 'Followed user' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const user = await User.findById(req.user.id);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    user.following = user.following.filter(id => id.toString() !== targetId);
    target.followers = target.followers.filter(id => id.toString() !== user.id);
    await user.save();
    await target.save();
    res.json({ message: 'Unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;
    const [items, total, unread] = await Promise.all([
      Notification.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user.id }),
      Notification.countDocuments({ user: req.user.id, read: false })
    ]);
    res.json({ items, pagination: { total, page, limit }, unread });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification marked read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.likeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).populate('user');
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const hasLiked = review.likes.some(uid => uid.toString() === req.user.id);
    if (hasLiked) {
      review.likes = review.likes.filter(uid => uid.toString() !== req.user.id);
    } else {
      review.likes.push(req.user.id);
      await Notification.create({
        user: review.user._id,
        type: 'like',
        message: `${req.user.name} liked your review`,
        meta: { review: review._id }
      });
    }
    await review.save();
    res.json({ message: hasLiked ? 'Unliked' : 'Liked', likes: review.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.commentOnReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const review = await Review.findById(id).populate('user');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.comments.push({ user: req.user.id, text });
    await review.save();
    await Notification.create({
      user: review.user._id,
      type: 'comment',
      message: `${req.user.name} commented on your review`,
      meta: { review: review._id }
    });
    res.status(201).json({ message: 'Comment added', comments: review.comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
