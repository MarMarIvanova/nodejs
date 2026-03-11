const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/library';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

async function connect() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      console.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}):`, err.message);
      if (attempt === MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

module.exports = { connect, mongoose };
