import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Save io instance to app local context to make it accessible in controllers
app.set('io', io);

// Socket.io connection listener
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Simple real-time chat helper for user-admin
  socket.on('sendMessage', (data) => {
    // Broadcast message to everyone else (or admin)
    socket.broadcast.emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
