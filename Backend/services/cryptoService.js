// services/cryptoService.js
const axios = require('axios');

let cache = {
  timestamp: 0,
  prices: null
};

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

async function getCryptoPrices() {
  const now = Date.now();

  // If cached and less than 10 seconds old
  if (cache.prices && (now - cache.timestamp) < 10000) {
    return cache.prices;
  }

  try {
    const response = await axios.get(COINGECKO_API, {
      params: {
        ids: 'bitcoin,ethereum',
        vs_currencies: 'usd'
      }
    });

    const prices = {
      BTC: response.data.bitcoin.usd,
      ETH: response.data.ethereum.usd
    };

    cache = {
      timestamp: now,
      prices
    };

    return prices;

  } catch (error) {
    console.error('⚠️ Failed to fetch crypto prices:', error.message);
    if (cache.prices) return cache.prices; // fallback to last known
    throw new Error('Unable to fetch prices and no cached value exists.');
  }
}

function convertUsdToCrypto(usdAmount, currency, prices) {
  const price = prices[currency];
  if (!price) throw new Error('Unsupported currency');
  return usdAmount / price;
}

function convertCryptoToUsd(cryptoAmount, currency, prices) {
  const price = prices[currency];
  if (!price) throw new Error('Unsupported currency');
  return cryptoAmount * price;
}

module.exports = {
  getCryptoPrices,
  convertUsdToCrypto,
  convertCryptoToUsd
};
