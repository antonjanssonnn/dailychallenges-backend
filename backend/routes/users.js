const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const FeedEvent = require('../models/FeedEvent');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Multer consts.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100 MB limit


//Model imports
const Challenge = require('../models/Challenge');


dotenv.config();

const usersRouter = (wss) => {
  const router = require('express').Router();
// Register a new user
  router.post('/register', async (req, res) => {
    try {
      const { username, password, email } = req.body; // Add email to the destructuring assignment

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Check if the user already exists by username
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        return res.status(400).json('Username already exists');
      }

      // Check if the user already exists by email
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return res.status(400).json('Email already exists');
      }

      const defaultProfilePicture = 'https://res.cloudinary.com/dwouoqad5/image/upload/v1681378912/profile_pictures/zyl8g1i6tlync4gdsqwj.jpg'
      // Create a new user
      const newUser = new User({ username, password, email, profilePicture: defaultProfilePicture }); // Add email to the new user object
      await newUser.save();

      res.status(201).json('User registered successfully');
    } catch (error) {
      res.status(500).json('Error: ' + error);
    }
  });

// Authenticate and log in a user
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Check if the user exists using either email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json('Invalid email, username or password');
    }

    // Check if the password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json('Invalid email, username or password');
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

    // Send WebSocket event after saving user and challenge
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("client in ready state and websocket is open")
        client.send(JSON.stringify({
          type: 'challengeCompleted',
          payload: {
            userId: user._id,
            challengeId: req.params.challengeId,
            username: user.username, // Assumes the user has a 'username' field
            challengeTitle: challenge.title, // Assumes the challenge has a 'title' field
            profilePicture: user.profilePicture
          },
        }));
      }
    });

    // Store the feed event in the database without the profile picture
    const feedEvent = new FeedEvent({
      userId: user._id,
      challengeId: req.params.challengeId,
      username: user.username,
      challengeTitle: challenge.title,
    });

    await feedEvent.save();
    console.log("Challenge completed successfully!")

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

  router.get('/user/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json('User not found');
      }

      // Return only necessary fields
      res.status(200).json({
        _id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
      });
    } catch (error) {
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
      const page = parseInt(req.query.page) || 1;
      const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
  
      const totalUsers = await User.countDocuments();
      const totalPages = Math.ceil(totalUsers / itemsPerPage);
  
      const users = await User.find()
        .sort({ streak: -1 })
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage);
  
      res.json({
        users,
        totalPages,
      });
    } catch (error) {
      res.status(500).json('Error: ' + error);
    }
  });

// Upload profile picture
router.post('/upload-profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    console.log("This is the user", user)
    if (!user) {
      console.log('User not found:', req.user.id);
      res.status(404).json('User not found');
      return;
    }

    const { imageBase64 } = req.body;
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'profile_pictures',
    });

    // Save the image URL to the user's profile
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { profilePicture: result.secure_url },
      { new: true }
    );

    console.log('Updated user:', updatedUser);

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json('Error uploading profile picture');
  }
});

 
  return router;
};

module.exports = usersRouter;
