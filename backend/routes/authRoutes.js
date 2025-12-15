const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllUsers } = require('../controllers/authController');

// Auth routes
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
  ],
  registerUser
);

router.post('/login', loginUser);

// Member-3 routes
router.get('/profile', protect, (req, res) => {
  res.json({ message: 'Profile accessed', user: req.user });
});

router.get('/admin/users', protect, adminOnly, getAllUsers);

router.get('/admin/check', protect, adminOnly, (req, res) => {
  res.json({ message: 'Admin verified' });
});

module.exports = router;
