// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  usdAmount: Number,
  cryptoAmount: Number,
  currency: { type: String, enum: ['BTC', 'ETH'] },
  transactionType: { type: String, enum: ['deposit', 'bet', 'cashout'] },
  transactionHash: String,
  priceAtTime: Number,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

