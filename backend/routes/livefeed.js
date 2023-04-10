const FeedEvent = require('../models/FeedEvent');
const router = require('express').Router();

// API endpoint to fetch the latest feed data
router.get('/feed', async (req, res) => {
  try {
    const feedEvents = await FeedEvent.find().sort({ createdAt: -1 }).limit(10);
    res.json(feedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;

