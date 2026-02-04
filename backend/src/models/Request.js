const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String },
  bloodType: { type: String, required: true },
  units: { type: Number, default: 1 },
  location: { type: String, required: true },
  note: { type: String },
  status: { type: String, enum: ['open','matched','closed'], default: 'open' },
  matchedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }]
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
