import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Only connect if admin or logged in really
        const newSocket = io('http://localhost:5000', {
            transports: ['websocket'], // Force websocket
        });
        setSocket(newSocket);

        // Initial connection logging
        newSocket.on('connect', () => {
            console.log('Connected to socket:', newSocket.id);
        });

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
