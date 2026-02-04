const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String },
  bloodType: { type: String },
  location: { type: String },
  lastDonationDate: { type: Date },
  available: { type: Boolean, default: true },
  registrationExpiresAt: { type: Date },
  status: { type: String, enum: ['active', 'expired'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
