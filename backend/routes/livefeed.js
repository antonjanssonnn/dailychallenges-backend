const FeedEvent = require('../models/FeedEvent');
const router = require('express').Router();

// API endpoint to fetch the latest feed data
router.get('/feed', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
    const skip = (page - 1) * itemsPerPage;

    const feedEvents = await FeedEvent.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage);

    res.json(feedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
