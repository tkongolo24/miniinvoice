// models/token.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['verify', 'magic-link', 'reset'],
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);