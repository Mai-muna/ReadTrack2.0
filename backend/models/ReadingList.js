const mongoose = require("mongoose");

const readingListSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    status: {
      type: String,
      enum: ["wantToRead", "currentlyReading", "finished"],
      default: "wantToRead"
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReadingList", readingListSchema);
