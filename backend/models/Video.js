// /backend/models/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  filename:   String,      // e.g. "1688491200000-IMG_3044.MOV"
  path:       String,      // e.g. "uploads/1688491200000-IMG_3044.MOV"
  size:       Number,
  mimeType:   String,
  recipient:  {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},      // if you’re storing videoEmail
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
