const mongoose = require("mongoose");
const User = require("../models/User");
const Book = require("../models/Book");
const ReadingList = require("../models/ReadingList");

// ✅ Add a book to reading list
exports.addToReadingList = async (req, res) => {
  try {
    const { bookId, status } = req.body;

    if (!bookId) return res.status(400).json({ message: "Book ID required" });

    const validStatus = ["wantToRead", "currentlyReading", "finished"];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (!req.user) return res.status(401).json({ message: "User not authenticated" });
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid Book ID" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Migrate legacy entries where readingList stored ObjectIds directly
    user.readingList = user.readingList.map(entry => {
      if (entry && entry.book) return entry;
      try {
        if (mongoose.Types.ObjectId.isValid(entry)) {
          return { book: entry, status: 'wantToRead', addedAt: new Date() };
        }
      } catch (e) { }
      return entry;
    });

    // Prevent duplicates after migration
    const exists = user.readingList.some(entry => entry.book && entry.book.toString() === bookId);
    if (exists) return res.status(400).json({ message: "Book already in reading list" });

    const newEntry = { book: new mongoose.Types.ObjectId(bookId), status: status || "wantToRead", addedAt: new Date() };
    user.readingList.push(newEntry);

    await ReadingList.findOneAndUpdate(
      { user: req.user._id, book: bookId },
      { $set: { status: status || "wantToRead", progress: 0, lastUpdated: new Date() } },
      { upsert: true, new: true }
    );

    await user.save();
    res.status(201).json({ message: "Book added to reading list", added: newEntry });
  } catch (error) {
    console.error("AddToReadingList Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update reading status
exports.updateReadingStatus = async (req, res) => {
  try {
    const { bookId, status } = req.body;

    const validStatus = ["wantToRead", "currentlyReading", "finished"];
    if (!status || !validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }

    if (!req.user) return res.status(401).json({ message: "User not authenticated" });
    if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({ message: "Invalid Book ID" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const item = user.readingList.find(entry => entry.book && entry.book.toString() === bookId);
    if (!item) return res.status(404).json({ message: "Book not in reading list" });

    item.status = status;
    await user.save();

    await ReadingList.findOneAndUpdate(
      { user: req.user._id, book: bookId },
      { $set: { status, lastUpdated: new Date() } },
      { upsert: true }
    );

    res.json({ message: "Reading status updated" });
  } catch (error) {
    console.error("UpdateReadingStatus Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Remove a book from reading list
exports.removeFromReadingList = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!req.user) return res.status(401).json({ message: "User not authenticated" });
    if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({ message: "Invalid Book ID" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const beforeCount = user.readingList.length;
    user.readingList = user.readingList.filter(entry => entry.book && entry.book.toString() !== bookId);

    if (user.readingList.length === beforeCount) {
      return res.status(404).json({ message: "Book not in reading list" });
    }

    await user.save();
    await ReadingList.findOneAndDelete({ user: req.user._id, book: bookId });
    res.json({ message: "Book removed from reading list" });
  } catch (error) {
    console.error("RemoveFromReadingList Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get full reading list
exports.getReadingList = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "User not authenticated" });

    const user = await User.findById(req.user._id).populate("readingList.book");
    if (!user) return res.status(404).json({ message: "User not found" });

    const progressMap = await ReadingList.find({ user: req.user._id }).lean();
    const byBook = progressMap.reduce((acc, entry) => {
      acc[entry.book.toString()] = entry;
      return acc;
    }, {});

    const combined = user.readingList.map((entry) => {
      const tracking = byBook[entry.book?._id?.toString()] || {};
      return {
        ...entry.toObject(),
        progress: tracking.progress || 0,
        lastUpdated: tracking.lastUpdated || null,
      };
    });

    res.json(combined);
  } catch (error) {
    console.error("GetReadingList Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Progress
exports.updateProgress = async (req, res) => {
  try {
    const { bookId, progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Progress must be 0–100" });
    }

    const entry = await ReadingList.findOneAndUpdate(
      { user: req.user.id, book: bookId },
      {
        $set: {
          progress,
          ...(progress === 100 ? { status: "finished" } : {}),
          lastUpdated: Date.now(),
          ...(progress === 100 ? { finishedAt: new Date() } : {})
        }
      },
      { new: true }
    );

    if (!entry) return res.status(404).json({ message: "Book not found in reading list" });

    await User.updateOne(
      { _id: req.user.id, "readingList.book": bookId },
      {
        $set: {
          "readingList.$.status": progress === 100 ? "finished" : entry.status || "currentlyReading",
          "readingList.$.updatedAt": new Date()
        }
      }
    );

    res.json({ message: "Progress updated", entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
