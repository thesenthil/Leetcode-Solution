import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../services/api';

const useSocket = () => {
  const { token } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return undefined;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
};

export default useSocket;
