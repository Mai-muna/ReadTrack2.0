const Book = require('../models/Book');

// CREATE A BOOK (ADMIN ONLY)
exports.createBook = async (req, res) => {
  try {
    const { title, author, genres, synopsis, coverUrl } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    const book = await Book.create({
      title,
      author,
      genres: genres || [],
      synopsis: synopsis || "",
      coverUrl: coverUrl || "",
      createdBy: req.user.id
    });

    res.status(201).json({ message: "Book created", book });
  } catch (error) {
    res.status(500).json({ message: "Error creating book", error: error.message });
  }
};

// GET ALL BOOKS (PUBLIC)
exports.getBooks = async (req, res) => {
  try {
    const { q, author, genre, page = 1, limit = 20, sortBy } = req.query;
    const filter = {};

    if (q) {
      // text search on title and synopsis and author
      const regex = new RegExp(q, 'i');
      filter.$or = [{ title: regex }, { synopsis: regex }, { author: regex }];
    }
    if (author) filter.author = new RegExp(author, 'i');
    if (genre) filter.genres = { $in: [genre] };

    let query = Book.find(filter);

    // sorting
    if (sortBy === 'rating') query = query.sort({ ratingsAverage: -1 });
    else if (sortBy === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ title: 1 });

    // pagination
    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));

    const books = await query.exec();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET SINGLE BOOK (PUBLIC)
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book", error: error.message });
  }
};

// UPDATE BOOK (ADMIN ONLY)
exports.updateBook = async (req, res) => {
  try {
    const updates = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book updated", book });
  } catch (error) {
    res.status(500).json({ message: "Error updating book", error: error.message });
  }
};

// DELETE BOOK (ADMIN ONLY)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting book", error: error.message });
  }
};
