#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/blooddb';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.argv[2];
const ADMIN_PASS = process.env.ADMIN_PASS || process.argv[3];
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrator';

if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error('Usage: set ADMIN_EMAIL and ADMIN_PASS in .env or pass as args: node scripts/createAdmin.js admin@example.com password');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const hashed = await bcrypt.hash(ADMIN_PASS, 10);

    let user = await User.findOne({ email: ADMIN_EMAIL });
    if (user) {
      user.role = 'admin';
      user.password = hashed;
      user.name = user.name || ADMIN_NAME;
      await user.save();
      console.log(`Existing user updated to admin: ${ADMIN_EMAIL}`);
    } else {
      user = new User({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashed, role: 'admin' });
      await user.save();
      console.log(`Admin user created: ${ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

main();
