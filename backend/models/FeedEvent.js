const mongoose = require('mongoose');

const FeedEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  challengeTitle: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FeedEvent = mongoose.model('FeedEvent', FeedEventSchema);

module.exports = FeedEvent;
