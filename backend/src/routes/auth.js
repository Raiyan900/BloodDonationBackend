const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, bloodType, location } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, phone, bloodType, location });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, bloodType: user.bloodType, location: user.location, createdAt: user.createdAt }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, bloodType: user.bloodType, location: user.location, createdAt: user.createdAt }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed admin user (can be called once)
router.post('/seed-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) return res.status(400).json({ message: 'Admin user already exists' });
    
    const hash = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@blood.local',
      password: hash,
      phone: '0000000000',
      role: 'admin',
      bloodType: 'O+',
      location: 'Global'
    });
    
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ 
      message: 'Admin user created',
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      token,
      credentials: { email: 'admin@blood.local', password: 'admin123' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
