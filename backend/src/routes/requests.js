const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const Donor = require('../models/Donor');

// Create a blood request (authenticated)
router.post('/', auth, async (req, res) => {
  try{
    const data = { ...req.body, requester: req.user.id };
    const request = await Request.create(data);
    // emit real-time event
    try{ req.io.emit('newRequest', { id: request._id, bloodType: request.bloodType, units: request.units, location: request.location, note: request.note }); }catch(e){ }
    res.json(request);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List requests (public) with optional filters
router.get('/', async (req, res) => {
  try{
    const { bloodType, location, status, page, limit } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(500, Math.max(1, parseInt(limit) || 50));
    const filter = {};
    if (bloodType) filter.bloodType = bloodType;
    if (status) filter.status = status;
    if (location) filter.location = new RegExp(location, 'i');
    const total = await Request.countDocuments(filter);
    const requests = await Request.find(filter).sort({ createdAt: -1 }).skip((p-1)*l).limit(l)
      .populate('requester', 'name email')
      .populate('matchedDonors', 'name location bloodType phone');
    res.json({ total, page: p, limit: l, data: requests });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Match a donor to a request (admin or owner)
router.patch('/:id/match', auth, async (req, res) => {
  try{
    const { donorId } = req.body;
    const request = await Request.findById(req.params.id).populate('requester', 'name email');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    // only admin or the requester can match
    if (req.user.role !== 'admin' && String(request.requester._id || request.requester) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });
    const donor = await Donor.findById(donorId).populate('user', 'name email');
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    request.matchedDonors.push(donor._id);
    request.status = 'matched';
    await request.save();
    // notify via socket
    try{ req.io.emit('requestMatched', { requestId: request._id, donorId: donor._id }); }catch(e){ }
    // send email notifications if configured (SMS removed)
    try{
      const { sendMail } = require('../utils/mailer');
      const requesterEmail = request.requester?.email;
      const donorEmail = donor.user?.email;
      if (donorEmail){
        await sendMail({ to: donorEmail, subject: 'You were matched to a blood request', text: `You have been matched to request ${request._id} for blood type ${request.bloodType} at ${request.location}. Please contact the requester.` });
      }
      if (requesterEmail){
        await sendMail({ to: requesterEmail, subject: 'A donor was matched to your request', text: `A donor (${donor.name || donorEmail}) was matched to your request ${request._id}. Donor contact: ${donor.phone || 'N/A'}.` });
      }
    }catch(e){ console.error('Notification error', e) }

    res.json(request);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
