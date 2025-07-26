// controllers/gameController.js
// controllers/gameController.js

const GameRound = require('../models/GameRound');
const Player = require('../models/Player');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { getCryptoPrices } = require('../utils/priceUtils');

const {

  convertUsdToCrypto,
  convertCryptoToUsd
} = require('../services/cryptoService');
const crypto = require('crypto');





exports.placeBet = async (req, res) => {
  try {
    const { playerId, usdAmount, currency } = req.body;

    // ✅ Validate input
    if (!playerId || !usdAmount || !currency) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ✅ Get current crypto price
    const prices = await getCryptoPrices(); // { BTC: 60000, ETH: 3500 }
    const price = prices[currency];
    if (!price) return res.status(400).json({ message: "Invalid currency" });

    // ✅ Convert USD to crypto
    const cryptoAmount = usdAmount / price;

    // ✅ Get player wallet
    const wallet = await Wallet.findOne({ playerId });
    if (!wallet || wallet.balances[currency] < cryptoAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // ✅ Deduct crypto from wallet
    wallet.balances[currency] -= cryptoAmount;
    await wallet.save();

    // ✅ Add to current game round
    const round = await GameRound.findOne().sort({ roundNumber: -1 });
    round.players.push({
      playerId,
      cryptoAmount,
      currency,
      status: 'pending'
    });
    await round.save();

    // ✅ Log transaction
    await Transaction.create({
      playerId,
      usdAmount,
      cryptoAmount,
      currency,
      transactionType: 'bet',
      transactionHash: crypto.randomBytes(8).toString('hex'),
      priceAtTime: price
    });

    res.status(200).json({ message: "Bet placed successfully" });

  } catch (err) {
    console.error("❌ Bet error:", err);
    res.status(500).json({ message: "Server error" });
  }
};





// --------------------- CASHOUT ---------------------


exports.cashout = async (req, res) => {
  try {
    const { playerId } = req.body;
    console.log("📨 Cashout request received for playerId:", playerId);

    const round = await GameRound.findOne().sort({ roundNumber: -1 });
    console.log("🎯 Latest round number:", round.roundNumber);

    const prices = await getCryptoPrices();

    console.log("🔍 Round players:", round.players.map(p => ({
      id: p.playerId.toString(),
      status: p.status,
      crypto: p.cryptoAmount
    })));

    const playerBet = round.players.find(
      (p) => p.playerId.toString() === playerId && p.status === 'pending'
    );

    if (!playerBet) {
      console.log("❌ No active/pending bet found for this player.");
      return res.status(400).json({ error: 'No active bet or already cashed out' });
    }

    const currentMultiplier = global.currentMultiplier || 1.0;
    const payoutCrypto = playerBet.cryptoAmount * currentMultiplier;
    const payoutUSD = payoutCrypto * prices[playerBet.currency];

    // Update round
    playerBet.cashoutMultiplier = currentMultiplier;
    playerBet.status = 'cashed_out';
    await round.save();

    // Update wallet
    const wallet = await Wallet.findOne({ playerId });
    wallet.balances[playerBet.currency] += payoutCrypto;
    await wallet.save();

    // Log transaction
    await Transaction.create({
      playerId,
      usdAmount: payoutUSD,
      cryptoAmount: payoutCrypto,
      currency: playerBet.currency,
      transactionType: 'cashout',
      transactionHash: crypto.randomBytes(8).toString('hex'),
      priceAtTime: prices[playerBet.currency]
    });

    console.log(`✅ Player ${playerId} cashed out at ${currentMultiplier}x and received $${payoutUSD.toFixed(2)}`);

    return res.status(200).json({
      message: 'Cashed out successfully',
      multiplier: currentMultiplier,
      payoutCrypto,
      payoutUSD
    });

  } catch (err) {
    console.error("💥 Cashout failed due to error:", err);
    res.status(500).json({ error: 'Cashout failed' });
  }
};



// --------------------- GET WALLET BALANCE ---------------------
exports.getWallet = async (req, res) => {
  try {
    const { playerId } = req.params;

    const wallet = await Wallet.findOne({ playerId });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const prices = await getCryptoPrices();

    const usdEquivalent = {
      BTC: wallet.balances.BTC * prices.BTC,
      ETH: wallet.balances.ETH * prices.ETH
    };

    res.status(200).json({
      balances: wallet.balances,
      usdEquivalent
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
};



exports.getTransactions = async (req, res) => {
  try {
    const { playerId } = req.params;
    const txs = await Transaction.find({ playerId }).sort({ createdAt: -1 }).limit(10);
    res.json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};


// --------------------- (Optional) TEST CONVERSION ROUTE ---------------------
exports.testConversion = async (req, res) => {
  try {
    const { usdAmount, currency } = req.body;
    const prices = await getCryptoPrices();
    const cryptoAmount = convertUsdToCrypto(usdAmount, currency, prices);
    res.json({ usdAmount, currency, cryptoAmount });
  } catch (err) {
    res.status(500).json({ error: 'Conversion failed' });
  }
};








// const GameRound = require('../models/GameRound');
// const Player = require('../models/Player');
// const Wallet = require('../models/Wallet');
// const Transaction = require('../models/Transaction');
// const {
//   getCryptoPrices,
//   convertUsdToCrypto
// } = require('../services/cryptoService');
// const crypto = require('crypto');

// exports.placeBet = async (req, res) => {
//   try {
//     const { playerId, usdAmount, currency } = req.body;

//     const player = await Player.findById(playerId);
//     if (!player) return res.status(404).json({ error: 'Player not found' });

//     const wallet = await Wallet.findOne({ playerId });
//     if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

//     const prices = await getCryptoPrices();
//     const cryptoAmount = convertUsdToCrypto(usdAmount, currency, prices);

//     // Check balance
//     if (wallet.balances[currency] < cryptoAmount) {
//       return res.status(400).json({ error: 'Insufficient balance' });
//     }

//     // Deduct from wallet
//     wallet.balances[currency] -= cryptoAmount;
//     await wallet.save();

//     // Find active round (latest one)
//     const round = await GameRound.findOne().sort({ roundNumber: -1 });

//     round.players.push({
//       playerId,
//       usdBet: usdAmount,
//       cryptoAmount,
//       currency,
//       status: 'pending'
//     });
//     await round.save();

//     // Log transaction
//     await Transaction.create({
//       playerId,
//       usdAmount,
//       cryptoAmount,
//       currency,
//       transactionType: 'bet',
//       transactionHash: crypto.randomBytes(8).toString('hex'),
//       priceAtTime: prices[currency]
//     });

//     return res.status(200).json({ message: 'Bet placed', cryptoAmount });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Bet failed' });
//   }
// };
