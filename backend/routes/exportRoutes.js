const express = require('express');
const { query } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { exportSummary } = require('../controllers/exportController');

const router = express.Router();

router.get(
  '/reading-summary',
  protect,
  [query('format').optional().isIn(['pdf', 'text']).withMessage('format must be pdf or text')],
  validate,
  exportSummary
);

module.exports = router;
