const ReadingList = require("../models/ReadingList");
const Book = require("../models/Book");

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // get user's genres from reading list
    const genreAgg = await ReadingList.aggregate([
      { $match: { user: ReadingList.db.base.Types.ObjectId.createFromHexString(userId) } },
      { $lookup: { from: "books", localField: "book", foreignField: "_id", as: "book" } },
      { $unwind: "$book" },
      { $unwind: "$book.genres" },
      { $group: { _id: "$book.genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const topGenres = genreAgg.map((g) => g._id).filter(Boolean);

    let results = [];

    // main path: recommend by genres
    if (topGenres.length) {
      results = await Book.find({ genres: { $in: topGenres } })
        .sort({ ratingsAverage: -1, ratingsCount: -1 })
        .limit(12);
    }

    // fallback: top rated + recent (dedupe)
    if (!results.length) {
      const [topRated, recent] = await Promise.all([
        Book.find().sort({ ratingsAverage: -1, ratingsCount: -1 }).limit(8),
        Book.find().sort({ createdAt: -1 }).limit(8)
      ]);

      const map = new Map();
      [...topRated, ...recent].forEach((b) => map.set(String(b._id), b));
      results = Array.from(map.values()).slice(0, 12);
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to load recommendations", error: err.message });
  }
};
