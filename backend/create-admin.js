const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/User");

async function run() {
  await mongoose.connect("mongodb+srv://mujtabagamingg_db_user:CGP8XPrj8RjMZRWL@cluster0.aduuep8.mongodb.net/iam_college_portal?retryWrites=true&w=majority");

  const existing = await User.findOne({ email: "admin@iam.com" });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash("Admin@123", 10);

  const admin = await User.create({
    name: "Admin",
    email: "admin@iam.com",
    password: hashed,
    role: "admin",
    mfa: { enabled: false, secret: null }
  });

  console.log("Created admin:");
  console.log(admin);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
