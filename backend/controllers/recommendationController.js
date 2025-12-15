const Book = require("../models/Book");
const ReadingList = require("../models/ReadingList");

exports.getRecommendations = async (req, res) => {
  const history = await ReadingList.find({ user: req.user.id })
    .populate("book");

  const genres = history.flatMap(h => h.book.genres);

  const recommendations = await Book.find({
    genres: { $in: genres }
  }).limit(5);

  res.json(recommendations);
};
