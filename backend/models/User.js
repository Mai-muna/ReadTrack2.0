const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  readingList: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
      status: {
        type: String,
        enum: ["wantToRead", "currentlyReading", "finished"],
        default: "wantToRead"
      },
      addedAt: { type: Date, default: Date.now }
    }
  ]
});

// Hash password before save
userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch(err){
    next(err);
  }
});

// Compare password
userSchema.methods.matchPassword = async function(plain){
  return await bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);

