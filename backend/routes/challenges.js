const router = require('express').Router();
const Challenge = require('../models/Challenge');

router.get('/today', async (req, res) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  try {
    const challenge = await Challenge.findOne({
      date: { $gte: currentDate, $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) },
    });

    if (challenge) {
      res.json(challenge);
    } else {
      res.status(404).json({ message: 'No challenge found for today.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily challenge:', error });
  }
});

module.exports = router;
