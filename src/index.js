import express from 'express';
import http from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import router from './routes/index.js';
import { setupSocketHandlers } from './websocket/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

setupSocketHandlers(io);

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use('/api', router);
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'login.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { server, io };