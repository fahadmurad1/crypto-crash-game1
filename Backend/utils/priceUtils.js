//priceutils.js
const axios = require('axios');

let cachedPrices = null;
let lastFetched = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

async function fetchPricesFromAPI() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';
  const res = await axios.get(url);
  return {
    BTC: res.data.bitcoin.usd,
    ETH: res.data.ethereum.usd,
  };
}

exports.getCryptoPrices = async () => {
  const now = Date.now();
  if (!cachedPrices || now - lastFetched > CACHE_DURATION) {
    try {
      cachedPrices = await fetchPricesFromAPI();
      lastFetched = now;
    } catch (err) {
      console.error('❌ Price API error:', err.message);
      throw new Error('Failed to fetch crypto prices');
    }
  }
  return cachedPrices;
};

