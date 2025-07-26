const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { getCryptoPrices } = require('../utils/priceUtils');

// 🎯 Game-related routes
router.post('/place-bet', gameController.placeBet);
router.post('/cashout', gameController.cashout);
router.get('/wallet/:playerId', gameController.getWallet);
router.get('/transactions/:playerId', gameController.getTransactions);
router.post('/test-conversion', gameController.testConversion); // optional


router.get('/game-history', async (req, res) => {
  try {
    const rounds = await GameRound.find().sort({ roundNumber: -1 }).limit(20);
    res.json(rounds);
  } catch (err) {
    console.error('❌ Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
});


// 💰 Get real-time crypto price
router.get('/price/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const prices = await getCryptoPrices();
    if (!prices[currency]) {
      return res.status(400).json({ error: 'Invalid currency' });
    }
    res.json({ price: prices[currency] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});


module.exports = router;

