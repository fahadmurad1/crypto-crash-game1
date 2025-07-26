// models/Wallet.js
const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  balances: {
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
  }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
