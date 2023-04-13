const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

// Routes
const usersRouter = require('./routes/users');
const challengesRouter = require('./routes/challenges');
const friendsRouter = require('./routes/friends');
const liveFeedRouter = require('./routes/livefeed');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app); // Create an HTTP server
const wss = new WebSocket.Server({ server }); // Attach WebSocket server to the HTTP server

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Define your routes and models here
app.use('/users', usersRouter(wss));
app.use('/challenges', challengesRouter);
app.use('/friends', friendsRouter);
app.use('/live-feed', liveFeedRouter);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => { // Use the HTTP server to listen instead of the Express app
  console.log(`Server is running on port: ${PORT}`);
});

wss.on('connection', (ws) => {
  console.log('WebSocket connection opened');

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});