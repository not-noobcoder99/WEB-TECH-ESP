import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let socket = null;

const socketService = {
  connect() {
    if (!socket) {
      socket = io(SOCKET_URL, { transports: ['websocket', 'polling'], autoConnect: true });
    }
    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  on(event, cb) {
    if (socket) socket.on(event, cb);
  },

  off(event, cb) {
    if (socket) socket.off(event, cb);
  },

  getSocket() {
    return socket;
  },
};

export default socketService;
