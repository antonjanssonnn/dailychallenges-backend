const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const dotenv = require('dotenv');

//Model imports
const Challenge = require('../models/Challenge');


dotenv.config();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json('Username already exists');
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json('User registered successfully');
  } catch (error) {
    res.status(500).json('Error: ' + error);
  }
});

// Authenticate and log in a user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json('Invalid username or password');
    }

    // Check if the password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json('Invalid username or password');
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });
    console.log(`this is the secret ${process.env.JWT_SECRET}`)
    console.log(`This is the token that the client creates: ${token}`)

    res.status(200).json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json('Error: ' + error);
  }
});


// Complete a daily challenge
router.post('/complete-challenge/:challengeId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const challenge = await Challenge.findById(req.params.challengeId);
    console.log(challenge)
    console.log(user)

    if (!user || !challenge) {
      return res.status(404).json('User or challenge not found');
    }

    // Check if the user has already completed the challenge
    if (user.challengesCompleted.includes(challenge._id)) {
      return res.status(400).json('Challenge already completed');
    }

    user.challengesCompleted.push(challenge._id);
    user.streak += 1;

    challenge.completedBy.push(user._id);

    await user.save();
    await challenge.save();

    res.status(200).json('Challenge completed successfully');
  } catch (error) {
    res.status(500).json('Error: ' + error);
  }
});

// Get user streak
router.get('/streak',auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json('User not found');
    }

    res.status(200).json({ streak: user.streak });
  } catch (error) {
    res.status(500).json('Error: ' + error);
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json('User not found');
    }
    console.log(user)
    res.status(200).json(user);
  }
  catch (error) {
    res.status(500).json('Error: ' + error);
  }
});

router.get('/completed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('challengesCompleted');

    if (!user) {
      return res.status(404).json('User not found');
    }

    res.status(200).json(user.challengesCompleted);
  } catch (error) {
    res.status(500).json('Error: ' + error);
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ streak: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json('Error: ' + error);
  }
});

module.exports = router;
