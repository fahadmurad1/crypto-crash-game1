// routes/betRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const GameRound = require("../models/GameRound");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

router.post("/bet", async (req, res) => {
  const { playerId, cryptoAmount, currency } = req.body;

  try {
    const round = await GameRound.findOne().sort({ roundNumber: -1 });
    if (!round) return res.status(404).json({ message: "No active round" });

    const wallet = await Wallet.findOne({ playerId });
    if (!wallet || wallet.balances[currency] < cryptoAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct from wallet
    wallet.balances[currency] -= cryptoAmount;
    await wallet.save();

    // Add bet to round
    round.players.push({
      playerId,
      cryptoAmount,
      currency,
      status: 'pending',
    });
    await round.save();

    // Record transaction
    await Transaction.create({
      playerId,
      cryptoAmount,
      currency,
      transactionType: 'bet',
      transactionHash: crypto.randomBytes(8).toString('hex'),
      priceAtTime: 0, // Optional: update with actual price
    });

    res.json({ message: "Bet placed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
