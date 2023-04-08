const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Add a friend
router.put('/add-friend/:friendUsername', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const friend = await User.findOne({ username: req.params.friendUsername });

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    user.friends.push(friend._id);
    await user.save();

    res.json({ message: 'Friend added successfully', friend });
  } catch (error) {
    res.status(500).json({ message: 'Error adding friend', error });
  }
});

// Remove a friend
router.put('/remove-friend/:friendUsername', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const friend = await User.findOne({ username: req.params.friendUsername });

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    user.friends = user.friends.filter((friendId) => !friendId.equals(friend._id));
    await user.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend', error });
  }
});

router.get('/list-friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).populate('friends', 'username -_id');
    console.log(user)
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends', error });
  }
});


module.exports = router;
