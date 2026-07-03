import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from './api';

let socket: Socket | null = null;

/** Single shared Socket.IO connection to the backend. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 800,
    });
  }
  return socket;
}
