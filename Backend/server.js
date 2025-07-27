// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { setupSocket } = require('./websocket/socketServer');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000, // No need for useNewUrlParser & useUnifiedTopology anymore
}).then(() => {
  console.log('✅ MongoDB Atlas connected successfully');

  // ✅ Only run routes and socket setup after DB is connected
  const gameRoutes = require('./routes/gameRoutes');
  app.use('/api', gameRoutes);

  setupSocket(server);

  server.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  });

}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
