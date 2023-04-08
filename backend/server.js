const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

//Routes
const usersRouter = require('./routes/users');
const challengesRouter = require('./routes/challenges');
const friendsRouter = require('./routes/friends');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Define your routes and models here
app.use('/users', usersRouter);
app.use('/challenges', challengesRouter);
app.use('/friends', friendsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
