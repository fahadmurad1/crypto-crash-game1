// seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const Player = require('../models/Player');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clean up old data
    await Player.deleteMany({});
    await Wallet.deleteMany({});
    await Transaction.deleteMany({});

    // Create Player
    const player = await Player.create({
      name: 'Test User',
      email: 'test@example.com'
    });

    // Create Wallet
    await Wallet.create({
      playerId: player._id,
      balances: {
        BTC: 2.5,
        ETH: 10
      }
    });

    // Create Transactions
    await Transaction.insertMany([
      {
        playerId: player._id,
        usdAmount: 1000,
        cryptoAmount: 0.05,
        currency: 'BTC',
        transactionType: 'deposit',
        transactionHash: '0xabc123',
        priceAtTime: 20000
      },
      {
        playerId: player._id,
        usdAmount: 250,
        cryptoAmount: 0.01,
        currency: 'BTC',
        transactionType: 'bet',
        transactionHash: '0xdef456',
        priceAtTime: 25000
      }
    ]);

    console.log('✅ Seeded Player, Wallet, and Transactions');
    console.log('🆔 Use this Player ID:', player._id.toString());

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
}

seed();
