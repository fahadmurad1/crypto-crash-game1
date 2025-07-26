const { Server } = require("socket.io");
const { generateCrashPoint } = require("../services/crashEngine");
const GameRound = require("../models/GameRound");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { getCryptoPrices } = require("../services/cryptoService");
const crypto = require("crypto");

// 🌐 Global values
global.currentMultiplier = 1.0;
global.roundNumber = 0; // ✅ Restart round number from 0

let io;
let gameLoopStarted = false;

async function setupSocket(server) {
    await GameRound.deleteMany({});
  global.roundNumber = 0;

  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`❌ Player disconnected: ${socket.id}`);
    });

    // 💸 Handle cashout from client
    socket.on("cashout", async ({ playerId }) => {
      try {
        const round = await GameRound.findOne().sort({ roundNumber: -1 });
        const prices = await getCryptoPrices();

        const playerBet = round.players.find(
          (p) => p.playerId.toString() === playerId && p.status === "pending"
        );

        if (!playerBet) {
          return socket.emit("error", { message: "No active bet to cash out" });
        }

        const currentMultiplier = global.currentMultiplier || 1.0;
        const payoutCrypto = playerBet.cryptoAmount * currentMultiplier;
        const payoutUSD = payoutCrypto * prices[playerBet.currency];

        // Update bet
        playerBet.cashoutMultiplier = currentMultiplier;
        playerBet.status = "cashed_out";
        await round.save();

        // Update wallet
        const wallet = await Wallet.findOne({ playerId });
        wallet.balances[playerBet.currency] += payoutCrypto;
        await wallet.save();

        // Log transaction
        await Transaction.create({
          playerId,
          usdAmount: payoutUSD,
          cryptoAmount: payoutCrypto,
          currency: playerBet.currency,
          transactionType: "cashout",
          transactionHash: crypto.randomBytes(8).toString("hex"),
          priceAtTime: prices[playerBet.currency],
        });

        io.emit("playerCashedOut", {
          playerId,
          multiplier: currentMultiplier,
          payoutCrypto,
          payoutUSD,
        });

        console.log(`💸 Player ${playerId} cashed out at ${currentMultiplier}x`);
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: "Cashout failed" });
      }
    });
  });

  if (!gameLoopStarted) {
    gameLoopStarted = true;
    startGameLoop();
  }
}

function startGameLoop() {
  setInterval(async () => {
    const currentRoundNumber = global.roundNumber++; // ✅ Always starts from 0 on restart

    const seed = crypto.randomBytes(16).toString("hex");
    const crashPoint = generateCrashPoint(seed, currentRoundNumber);
    console.log(`🎮 Round ${currentRoundNumber} starting, crash at ${crashPoint}x`);

    // Create new round in DB
    await GameRound.create({
      roundNumber: currentRoundNumber,
      crashMultiplier: crashPoint,
      seed,
      players: [],
    });

    // Notify all clients
    io.emit("roundStart", { round: currentRoundNumber });

    // Reset multiplier
    global.currentMultiplier = 1.0;
    let multiplier = 1.0;
    const growthRate = 0.01;

    const tick = setInterval(() => {
      multiplier += multiplier * growthRate;
      multiplier = parseFloat(multiplier.toFixed(2));
      global.currentMultiplier = multiplier;

      io.emit("multiplierUpdate", { multiplier });

      if (multiplier >= crashPoint) {
        clearInterval(tick);
        io.emit("roundCrash", {
          crashPoint,
          round: currentRoundNumber,
        });
        console.log(`💥 Round ${currentRoundNumber} crashed at ${crashPoint}x`);
      }
    }, 100); // update every 100ms
  }, 10000); // new round every 10s
}

module.exports = { setupSocket };




// const { Server } = require("socket.io");
// const { generateCrashPoint } = require("../services/crashEngine");
// const GameRound = require("../models/GameRound");

// let io;
// let roundNumber = 1;
// let interval = null;

// function setupSocket(server) {
//   io = new Server(server, {
//     cors: {
//       origin: "*"
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log(`🔌 Player connected: ${socket.id}`);

//     socket.on("disconnect", () => {
//       console.log(`❌ Player disconnected: ${socket.id}`);
//     });

//     socket.on("cashout", (data) => {
//       // You’ll implement cashout logic later
//       console.log(`💸 Cashout request from player ${data.playerId}`);
//     });
//   });

//   startGameLoop();
// }

// function startGameLoop() {
//   setInterval(async () => {
//     const seed = crypto.randomBytes(16).toString('hex');
//     const crashPoint = generateCrashPoint(seed, roundNumber);

//     console.log(`🎮 Round ${roundNumber} starting, crash at ${crashPoint}x`);

//     // Save to DB
//     const newRound = await GameRound.create({
//       roundNumber,
//       crashMultiplier: crashPoint,
//       seed
//     });

//     let multiplier = 1.0;
//     const growthRate = 0.01; // adjust for speed
//     let running = true;

//     io.emit("roundStart", { round: roundNumber });

//     interval = setInterval(() => {
//       multiplier += multiplier * growthRate;
//       multiplier = parseFloat(multiplier.toFixed(2));

//       io.emit("multiplierUpdate", { multiplier });

//       if (multiplier >= crashPoint) {
//         clearInterval(interval);
//         io.emit("roundCrash", {
//           crashPoint,
//           round: roundNumber
//         });

//         console.log(`💥 Round ${roundNumber} crashed at ${crashPoint}x`);
//         roundNumber++;
//       }

//     }, 100); // updates every 100ms
//   }, 10000); // new round every 10 seconds
// }

// module.exports = { setupSocket };
