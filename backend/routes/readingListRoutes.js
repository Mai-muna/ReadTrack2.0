const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const validate = require('../middleware/validationMiddleware');
const RL = require('../controllers/readingListController');

router.post(
  '/add',
  protect,
  [body('bookId').isMongoId(), body('status').optional().isIn(['wantToRead', 'currentlyReading', 'finished'])],
  validate,
  RL.addToReadingList
);
router.put(
  '/update-status',
  protect,
  [body('bookId').isMongoId(), body('status').isIn(['wantToRead', 'currentlyReading', 'finished'])],
  validate,
  RL.updateReadingStatus
);
router.delete('/remove/:bookId', protect, [param('bookId').isMongoId()], validate, RL.removeFromReadingList);
router.get('/', protect, RL.getReadingList);
router.put(
  '/update-progress',
  protect,
  [body('bookId').isMongoId(), body('progress').isFloat({ min: 0, max: 100 })],
  validate,
  RL.updateProgress
);
module.exports = router;

