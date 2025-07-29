import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WalletInfo({ playerId }) {
  const [balances, setBalances] = useState({});
  const [prices, setPrices] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  // Fetch wallet
  useEffect(() => {
    if (!playerId) return;
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/wallet/${playerId}`);
        setBalances(res.data.balances);
      } catch (err) {
        console.error(err);
        setError('❌ Failed to load wallet.');
      }
    };
    fetchWallet();
  }, [playerId]);

  // Fetch prices every 10s
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [btcRes, ethRes] = await Promise.all([
         axios.get(`${process.env.REACT_APP_API_URL}/price/BTC`),
          axios.get(`${process.env.REACT_APP_API_URL}/price/ETH`)
        ]);
        setPrices({
          BTC: btcRes.data.price,
          ETH: ethRes.data.price
        });
      } catch (err) {
        console.error('Failed to fetch prices:', err);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch transactions
  useEffect(() => {
    if (!playerId) return;
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/transactions/${playerId}`);
        setTransactions(res.data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      }
    };
    fetchTransactions();
  }, [playerId]);

  const formatUSD = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (ts) => new Date(ts).toLocaleString();

  const btcUSD = (balances.BTC || 0) * (prices.BTC || 0);
  const ethUSD = (balances.ETH || 0) * (prices.ETH || 0);
  const totalUSD = btcUSD + ethUSD;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>👛 Wallet</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <strong>BTC:</strong> {balances.BTC?.toFixed(6) || '0.000000'}
        {prices.BTC && <span style={{ marginLeft: 10 }}>≈ {formatUSD(btcUSD)}</span>}
      </div>

      <div>
        <strong>ETH:</strong> {balances.ETH?.toFixed(6) || '0.000000'}
        {prices.ETH && <span style={{ marginLeft: 10 }}>≈ {formatUSD(ethUSD)}</span>}
      </div>

      <div style={{ marginTop: 10, fontWeight: 'bold' }}>
        💰 Total Value: {formatUSD(totalUSD)}
      </div>

      {/* 🔽 Transaction History */}
      <div style={{ marginTop: 30 }}>
        <h3>🧾 Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table border="1" cellPadding="6" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Type</th>
                <th>USD</th>
                <th>Crypto</th>
                <th>Currency</th>
                <th>Price</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>{tx.transactionType}</td>
                  <td>${tx.usdAmount.toFixed(2)}</td>
                  <td>{tx.cryptoAmount.toFixed(6)}</td>
                  <td>{tx.currency}</td>
                  <td>${tx.priceAtTime.toFixed(2)}</td>
                  <td>{formatDate(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default WalletInfo;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function WalletInfo({ playerId }) {
//   const [wallet, setWallet] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!playerId) return;

//     const fetchWallet = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `${process.env.REACT_APP_API_URL}/wallet/${playerId}`
//         );
//         setWallet(res.data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Failed to load wallet:", err.message);
//         setWallet(null);
//         setLoading(false);
//       }
//     };

//     fetchWallet();
//   }, [playerId]);

//   if (!playerId) return null;
//   if (loading) return <p>Loading wallet...</p>;
//   if (!wallet) return <p>⚠️ Wallet not found for this player.</p>;

//   return (
//     <div>
//       <h3>👛 Wallet</h3>
//       <ul>
//         <li>BTC: {wallet.balances.BTC.toFixed(6)} (~${wallet.usdEquivalent.BTC.toFixed(2)})</li>
//         <li>ETH: {wallet.balances.ETH.toFixed(6)} (~${wallet.usdEquivalent.ETH.toFixed(2)})</li>
//       </ul>
//     </div>
//   );
// }

// export default WalletInfo;
