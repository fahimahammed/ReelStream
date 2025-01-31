import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

let io: SocketIOServer;

export const initSocket = (server: Server) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    console.log("✅ Socket.io initialized on port 3002");

    return io;
};

export const getSocketInstance = (): SocketIOServer => {
    if (!io) throw new Error("Socket.io has not been initialized!");
    return io;
};
