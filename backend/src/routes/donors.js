const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Donor = require('../models/Donor');

// Create or update donor profile for authenticated user (30-day registration)
router.post('/', auth, async (req, res) => {
  try{
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days
    
    const data = { 
      ...req.body, 
      user: req.user.id,
      registrationExpiresAt: expiresAt,
      status: 'active'
    };
    
    let donor = await Donor.findOne({ user: req.user.id });
    if (donor) {
      donor = await Donor.findByIdAndUpdate(donor._id, data, { new: true });
    } else {
      donor = await Donor.create(data);
    }
    res.json(donor);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user's donor profile (authenticated)
router.get('/me/profile', auth, async (req, res) => {
  try{
    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) return res.status(404).json({ message: 'Not registered as donor' });
    res.json(donor);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: list donors with optional filters (only active, non-expired registrations)
router.get('/', async (req, res) => {
  try{
    const { bloodType, location, page, limit } = req.query;
    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(500, Math.max(1, parseInt(limit) || 50));
    
    const filter = { 
      available: true,
      status: 'active',
      registrationExpiresAt: { $gt: new Date() } // Not expired
    };
    
    if (bloodType) filter.bloodType = bloodType;
    if (location) filter.location = new RegExp(location, 'i');
    
    const total = await Donor.countDocuments(filter);
    const donors = await Donor.find(filter).skip((p-1)*l).limit(l);
    res.json({ total, page: p, limit: l, data: donors });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donor by id
router.get('/:id', async (req, res) => {
  try{
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: 'Not found' });
    res.json(donor);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donor (owner or admin)
router.patch('/:id', auth, async (req, res) => {
  try{
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(donor.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });
    
    // If renewing registration, extend expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const updated = await Donor.findByIdAndUpdate(req.params.id, {
      ...req.body,
      registrationExpiresAt: expiresAt,
      status: 'active'
    }, { new: true });
    
    res.json(updated);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete donor (owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try{
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(donor.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });
    await Donor.findByIdAndDelete(donor._id);
    res.json({ success: true });
  }catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }) }
});

module.exports = router;
