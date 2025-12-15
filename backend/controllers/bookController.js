const mongoose = require("mongoose");
const Book = require("../models/Book");
const User = require("../models/User");

// ✅ Create new book
exports.createBook = async (req, res) => {
  try {
    const { title, author, genres, synopsis, coverUrl } = req.body;

    if (!title || !author) return res.status(400).json({ message: "Title and author are required" });

    // If genres is a string (legacy support), convert it into an array
    const genreArray = Array.isArray(genres) ? genres : genres ? [genres] : [];

    const newBook = new Book({
      title,
      author,
      genres: genreArray,
      synopsis,
      coverUrl,
    });

    await newBook.save();
    res.status(201).json({ message: "Book created", book: newBook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update book details
exports.updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, author, genres, synopsis, coverUrl } = req.body;

    const genreArray = Array.isArray(genres) ? genres : genres ? [genres] : [];

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { title, author, genres: genreArray, synopsis, coverUrl },
      { new: true }
    );

    if (!updatedBook) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book updated", book: updatedBook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book deleted", book: deletedBook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get a list of books
exports.getBooks = async (req, res) => {
  try {
    const { q, author, genre, minRating } = req.query;

    let filter = {};

    if (q) {
      filter.title = { $regex: q, $options: "i" };  // Case-insensitive search
    }
    if (author) {
      filter.author = { $regex: author, $options: "i" };
    }
    if (genre) {
      filter.genres = { $in: [genre] };
    }
    if (minRating) {
      filter.ratingsAverage = { $gte: minRating };
    }

    const books = await Book.find(filter);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get book details by ID
exports.getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get top-rated books
exports.getTopRatedBooks = async (req, res) => {
  try {
    const topBooks = await Book.find().sort({ ratingsAverage: -1 }).limit(10);
    res.json(topBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get recently added books
exports.getRecentlyAddedBooks = async (req, res) => {
  try {
    const recentBooks = await Book.find().sort({ createdAt: -1 }).limit(10);
    res.json(recentBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
