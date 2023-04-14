const Team = require('../models/Team');
const User = require('../models/User');

// Add this function below your other functions
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).send('Team not found');
    }

    // Populate the members array with user objects
    const members = await User.find({ _id: { $in: team.members } });

    // Return the team with populated members
    res.json({ ...team.toObject(), members });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
