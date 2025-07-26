// models/Player.js
// models/Player.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: String,
  email: String
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
