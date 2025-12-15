const Book = require("../models/Book");
const ReadingList = require("../models/ReadingList");

exports.getRecommendations = async (req, res) => {
  const history = await ReadingList.find({ user: req.user.id }).populate("book");
  const fallback = (await Book.find({ _id: { $in: [] } })) || [];
  const genres = history.flatMap(h => h.book?.genres || []);

  // If no progress entries, look at embedded list
  if (!genres.length) {
    const userBooks = await Book.find({ _id: { $in: req.user.readingList?.map((r) => r.book) || [] } });
    userBooks.forEach((b) => genres.push(...(b.genres || [])));
  }

  const recommendations = await Book.find({
    genres: { $in: genres.length ? genres : [''] }
  }).limit(5);

  res.json(recommendations.length ? recommendations : fallback);
};
