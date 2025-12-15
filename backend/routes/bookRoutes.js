const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController'); // ensure you have controller
const { protect, adminOnly } = require('../middleware/authMiddleware');

console.log(bookController);
console.log('bookController.getTopRatedBooks:', bookController.getTopRatedBooks);

router.get('/top/list', bookController.getTopRatedBooks);
router.get('/recent/list', bookController.getRecentlyAddedBooks);
router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);

router.post('/', protect, adminOnly, bookController.createBook);
router.put('/:id', protect, adminOnly, bookController.updateBook);
router.delete('/:id', protect, adminOnly, bookController.deleteBook);

module.exports = router;
