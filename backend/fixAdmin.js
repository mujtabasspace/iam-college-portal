require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  await User.updateOne(
    { email: "admin@college.local" },
    { $set: { role: "admin" } }
  );

  console.log("Admin role restored.");
  process.exit(0);
}

run();
