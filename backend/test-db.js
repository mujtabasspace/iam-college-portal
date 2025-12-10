const mongoose = require("mongoose");
const User = require("./src/models/User");

mongoose.connect("mongodb+srv://mujtabagamingg_db_user:CGP8XPrj8RjMZRWL@cluster0.aduuep8.mongodb.net/iam_college_portal?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to DB");
    return User.find();
  })
  .then(users => {
    console.log("Users in database:");
    console.log(users);
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
