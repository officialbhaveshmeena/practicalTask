const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    unique: true,
    type: String,
    required: true,
    validate: {
      validator: (v) => v.includes("@"),
      message: (props) => `${props.value} is not generic email`,
    },
  },
  password: {
    type: String,
  },
  token: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

//validation
userSchema.path("email").validate(async (value) => {
  const emailCount = await User.countDocuments({
    email: value,
  });
  return !emailCount;
}, "Email already exists");

userSchema.path("username").validate(async (value) => {
  return value.length;
}, "Please Enter User name");

userSchema.path("password").validate(async (value) => {
  return value.length && value != null;
}, "Please Enter Password");

module.exports = User;
