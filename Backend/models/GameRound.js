// models/GameRound.js
const mongoose = require('mongoose');

const gameRoundSchema = new mongoose.Schema({
  roundNumber: Number,
  crashMultiplier: Number,
  seed: String,
  players: [
    {
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
      cryptoAmount: Number,
      currency: String,
      status: String,
      cashoutMultiplier: Number
    }
  ]
});

module.exports = mongoose.model('GameRound', gameRoundSchema);
