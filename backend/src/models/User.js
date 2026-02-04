const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  bloodType: { type: String },
  location: { type: String },
  donationHistory: [{ date: Date, details: String }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
