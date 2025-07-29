import React, { useEffect, useState } from 'react';
import './App.css'; 
import socket from './socket';
import axios from 'axios';
import BetForm from './components/BetForm';
import WalletInfo from './components/WalletInfo';



function App() {
  const [playerId, setPlayerId] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [round, setRound] = useState(0);
  const [crashPoint, setCrashPoint] = useState(null);
  const [status, setStatus] = useState('');
  const [payout, setPayout] = useState(null);

  useEffect(() => {
    // Connect events (once on mount)
    socket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from socket server due to:', reason);
    });

    socket.on('roundStart', (data) => {
      console.log('🔁 roundStart', data);
      setRound(data.round);
      setCrashPoint(null);
      setStatus('🟢 New round started');
      setMultiplier(1.0);
      setPayout(null);
    });

    socket.on('multiplierUpdate', (data) => {
      setMultiplier(data.multiplier);
    });

    socket.on('roundCrash', (data) => {
      setCrashPoint(data.crashPoint);
      setStatus(`💥 Crashed at ${data.crashPoint}x`);
    });

    socket.on('playerCashedOut', (data) => {
      if (data.playerId === playerId) {
        setStatus(`✅ Cashed out at ${data.multiplier}x`);
        setPayout(data.payoutUSD.toFixed(2));
      }
    });

    // Cleanup once (not on playerId change!)
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roundStart');
      socket.off('multiplierUpdate');
      socket.off('roundCrash');
      socket.off('playerCashedOut');
    };
  }, [playerId]);

  const handleCashout = async () => {
    if (!playerId) {
      alert('Please enter Player ID before cashing out.');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/cashout`, {
        playerId,
      });

      const { payoutUSD, multiplier } = res.data;
      setPayout(payoutUSD.toFixed(2));
      setStatus(`✅ Cashed out at ${multiplier}x and won $${payoutUSD.toFixed(2)}`);
    } catch (err) {
      console.error('❌ Cashout error:', err);
      setStatus('❌ Cashout failed.');
    }
  };

  return (

    
    <div className="container">
      <h2>🚀 Crypto Crash Game</h2>

      <div>
        <label>
          Player ID:
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Enter Player ID"
            
          />
        </label>
      </div>

      <h3>🔁 Round: {round}</h3>
       <h2 style={{ fontSize: 40 }}>📈 Multiplier: {multiplier}x</h2>
      <h4>Status: {status}</h4>

      {payout && (
       <div className="status-box status-success">
          🤑 You won ${payout}
        </div>
      )}

      <button onClick={handleCashout} style={{ padding: 10, marginTop: 10 }}>
        💸 Cash Out
      </button>

      <hr style={{ margin: '20px 0' }} />

      <WalletInfo playerId={playerId} />
      <BetForm playerId={playerId} />
    </div>
  );
}

export default App;

