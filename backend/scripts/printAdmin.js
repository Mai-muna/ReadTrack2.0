const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function printAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await User.findOne({ email: 'admin@readtrack.local' }).lean();
    if (!admin) {
      console.log('Admin user not found');
      process.exit(0);
    }

    // Print selected fields for inspection
    console.log('Admin document:');
    console.log({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      passwordHashPreview: admin.password ? admin.password.slice(0, 10) + '...' : null,
      createdAt: admin.createdAt
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

printAdmin();
