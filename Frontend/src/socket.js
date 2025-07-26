// src/socket.js
// src/socket.js
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;
