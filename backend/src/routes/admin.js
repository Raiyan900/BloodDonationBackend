const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Request = require('../models/Request');
const Donor = require('../models/Donor');

function requireAdmin(req, res, next){
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
}

// List users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try{
    const users = await User.find().select('-password').limit(500);
    res.json(users);
  }catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }) }
});

// Delete user
router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  try{
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }) }
});

// List requests
router.get('/requests', auth, requireAdmin, async (req, res) => {
  try{
    const requests = await Request.find().sort({ createdAt: -1 }).limit(100).populate('requester', 'name email');
    res.json(requests);
  }catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }) }
});

// Delete request
router.delete('/requests/:id', auth, requireAdmin, async (req, res) => {
  try{
    await Request.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }) }
});

// List donors
router.get('/donors', auth, requireAdmin, async (req, res) => {
  try{
    const donors = await Donor.find().limit(500).populate('user', 'name email');
    res.json(donors);
  }catch(err){ console.error(err); res.status(500).json({ message: 'Server error' }) }
});

module.exports = router;
