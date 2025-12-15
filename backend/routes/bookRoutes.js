const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController'); // ensure you have controller
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);

router.post('/', protect, adminOnly, bookController.createBook);
router.put('/:id', protect, adminOnly, bookController.updateBook);
router.delete('/:id', protect, adminOnly, bookController.deleteBook);

module.exports = router;
