
# 🚀 Crypto Crash Game

A real-time multiplayer betting game where players bet in USD (converted to BTC/ETH), watch the multiplier rise, and cash out before it crashes! Built with **Node.js**, **Socket.io**, **MongoDB**, and **React**.

## 🔧 Features

- 🧑‍💻 Player wallet in BTC & ETH with real-time USD equivalent
- 💵 Bet in USD (converted to selected crypto using live rates)
- ⏫ Live multiplier updates via WebSocket
- 💣 Random crash based on provably fair logic
- 💸 Cash out before the crash to win!
- 📊 Transaction logging (bets & cashouts)
- 🕒 Game restarts every 10 seconds
- 📜 Game history & crash multipliers
- 🌍 Real-time crypto price fetching with 10s caching

---

## 📁 Project Structure

```
crypto-crash-game/
│
├── backend/
│   ├── models/           # Mongoose schemas: Player, Wallet, GameRound, Transaction
│   ├── controllers/      # Game logic: betting, cashout, wallet
│   ├── routes/           # Express API routes
│   ├── services/         # Price fetching, conversion, crash engine
│   ├── utils/            # Utilities like caching crypto prices
│   └── server.js         # Main backend app
│
├── frontend/
│   ├── components/       # BetForm, WalletInfo, Navbar, etc.
│   ├── pages/            # GameHistory
│   ├── App.jsx           # Main React App
│   └── socket.js         # Socket.io client
│
├── .env
└── README.md
```

---

## 🛠️ Setup Instructions

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

#### ➕ Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crypto_crash_game
```

#### ▶️ Run backend:

```bash
nodemon server.js
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
```

#### ➕ Create a `.env` file:

```env
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### ▶️ Run frontend:

```bash
npm start
```

---

## 📈 Conversion Logic

- **USD to Crypto:**  
  `$10` → selected currency BTC/ETH  
  `cryptoAmount = 10 / live_price`

- **Cashout:**  
  `cryptoAmount * multiplier = payoutCrypto`  
  `payoutCrypto * price = payoutUSD`

- All transactions are saved in MongoDB with:
  - `player_id`, `usd_amount`, `crypto_amount`, `currency`, `transaction_type`, `transaction_hash`, `price_at_time`, `timestamp`

---

## 🔐 Tech Stack

- **Frontend:** React, Axios, Socket.io-client
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB, Mongoose
- **APIs:** CoinGecko for price fetching
- **Security:** JWT (if added), Environment variables

---

## 📷 Screenshots

- 🎮 Game UI with live multiplier
- 📊 Wallet in BTC/ETH + USD
- 📋 Bet & Cashout logic
- 💥 Crash points every round

---

## 🚀 Future Improvements

- ✅ Add user authentication
- 📈 Player leaderboard
- 📊 View past game results
- 🎨 Improve UI with Tailwind or Material UI
- 💰 Referral/bonus system

---

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first.

---

## 📄 License

MIT

---

## 🙌 Developed By

**Fahad Zakir**  
Full-Stack Developer | 2026 Batch | JSS Academy of Technical Education, Noida

---
