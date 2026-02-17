const dns = require('dns');
// Set Google DNS to resolved SRV lookup issues
try {
    dns.setServers(['8.8.8.8']);
} catch (e) {
    console.log("Could not set DNS servers");
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow Vite client
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
const auctionRoutesObj = require('./routes/auction');

app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/auction', auctionRoutesObj.router); // Auction routes

// Socket Connection
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });

    // Example: Listen for join room if needed (not strict requirement based on prompt)
});

// Pass IO instance to routes
// Ideally we could use app.set('io', io) but direct injection works too for simple apps
auctionRoutesObj.setIo(io);

// Basic Route
app.get('/', (req, res) => {
    res.send('Welcome to the Auction App API');
});

// Start Server (Use server.listen instead of app.listen for socket.io)
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
