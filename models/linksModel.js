const mongoose = require("mongoose");

const linksSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userHandle: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  public: {
    type: Boolean,
    default: true,
  },
});

// model creation
const linksCollection = mongoose.model("links", linksSchema);

module.exports = linksCollection;
