const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const RL = require('../controllers/readingListController');

router.post('/add', protect, RL.addToReadingList);
router.put('/update-status', protect, RL.updateReadingStatus);
router.delete('/remove/:bookId', protect, RL.removeFromReadingList);
router.get('/', protect, RL.getReadingList);
router.put("/update-progress", protect, RL.updateProgress);
module.exports = router;

