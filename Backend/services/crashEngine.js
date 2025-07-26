// services/crashEngine.js
const crypto = require('crypto');

// Generate a provably fair crash point using seed + round number
function generateCrashPoint(seed, roundNumber, maxCrash = 120) {
  const hash = crypto.createHash('sha256').update(`${seed}-${roundNumber}`).digest('hex');
  const decimal = parseInt(hash.slice(0, 8), 16); // get part of hash
  const crash = (decimal % (maxCrash * 100)) / 100; // 2 decimals
  return Math.max(1.01, parseFloat(crash.toFixed(2))); // never < 1.01x
}

module.exports = {
  generateCrashPoint
};
