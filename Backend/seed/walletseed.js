const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Wallet = require('../models/Wallet');
const Player = require('../models/Player');

dotenv.config();

const Wallet = require('../models/Wallet'); // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crypto-crash-game';

const wallets = [
  {
    playerId: 'testuser',
    balances: {
      BTC: 1.0,
      ETH: 5.0
    }
  },
  {
    playerId: 'alice123',
    balances: {
      BTC: 0.5,
      ETH: 2.0
    }
  },
  {
    playerId: 'bob456',
    balances: {
      BTC: 2.0,
      ETH: 1.5
    }
  }
];

async function seedWallets() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Wallet.deleteMany({}); // Clears existing wallets
    await Wallet.insertMany(wallets);

    console.log('✅ Wallets seeded successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding wallets:', error);
    process.exit(1);
  }
}

seedWallets();
