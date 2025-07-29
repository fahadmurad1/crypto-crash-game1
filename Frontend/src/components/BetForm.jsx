// components/BetForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

function BetForm({ playerId }) {
  const [usdAmount, setUsdAmount] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [message, setMessage] = useState('');

  const handleBet = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/place-bet`, {
        playerId,
        usdAmount: parseFloat(usdAmount),
        currency,
      });

      setMessage(`✅ Bet placed: $${usdAmount} in ${currency}`);
      setUsdAmount('');
    } catch (err) {
      console.error(err);
      setMessage('❌ Bet failed: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  return (
    <form onSubmit={handleBet}>
      <h3>🎰 Place Bet</h3>
      <div>
        <input
          type="number"
          placeholder="USD Amount"
          value={usdAmount}
          onChange={(e) => setUsdAmount(e.target.value)}
          required
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
        </select>
        <button type="submit">Bet</button>
      </div>
      {message && <p>{message}</p>}
    </form>
  );
}

export default BetForm;

