import React, { useEffect, useState } from 'react';
import axios from 'axios';

function GameHistory() {
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/game-history');
        setRounds(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch game history:', err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📈 Game History</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc' }}>Round</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Crash Multiplier</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map((r, index) => (
            <tr key={index}>
              <td>{r.roundNumber}</td>
              <td>{r.crashPoint}x</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GameHistory;
