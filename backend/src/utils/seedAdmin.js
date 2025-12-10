require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/iam_college_portal';

async function seed() {
  await mongoose.connect(MONGO);
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@college.local';
  const pass = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }
  const hashed = await bcrypt.hash(pass, 10);
  const admin = await User.create({ name: 'Portal Admin', email, password: hashed, role: 'admin' });
  console.log('Created admin:', admin.email);
  console.log('Password:', pass);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
