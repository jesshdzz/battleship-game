import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // El puerto donde corre Vite
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('¡Un usuario se ha conectado! ID:', socket.id);

    socket.on('disconnect', () => {
        console.log('Usuario desconectado', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});