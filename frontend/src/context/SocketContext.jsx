import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({
  socket: null,
  onlineUsers: [],
  isOnline: () => false
});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      // Connect to same host or fallback
      const serverUrl = window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin;
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server:', newSocket.id);
        newSocket.emit('join_room', user._id);
        newSocket.emit('get_online_users');
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users || []);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setOnlineUsers([]);
      }
    }
  }, [user?._id]);

  const isOnline = (targetId) => {
    if (!targetId) return false;
    const strId = targetId.toString();
    return onlineUsers.includes(strId);
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);

// Preserves backward compatibility for callers expecting socket object
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  return ctx?.socket;
};
