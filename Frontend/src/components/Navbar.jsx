import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Optional CSS styling

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">🚀 Crypto Crash</div>
      <ul className="navbar-links">
        <li><Link to="/">🎮 Game</Link></li>
        <li><Link to="/wallet">👛 Wallet</Link></li>
        <li><Link to="/transactions">📑 Transactions</Link></li>
        <li><Link to="/history">📈 Game History</Link></li>
        <li><Link to="/rules">❓ Rules</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
