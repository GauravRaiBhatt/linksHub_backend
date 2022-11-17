const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  public: {
    type: Boolean,
    required: true,
    default: true,
  },
  userHandle: {
    type: String,
    required: true,
  },
  links: {
    type: Array,
    default: [],
  },
});

// model creation
const usersCollection = mongoose.model("users", usersSchema);

module.exports = usersCollection;
