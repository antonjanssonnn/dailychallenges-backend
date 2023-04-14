const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');


// Create a team
router.post('/create', auth, async (req, res) => {
    const { name } = req.body;
  
    try {
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(404).json('User not found');
      }
  
      const newTeam = new Team({
        name,
        admin: user,
        members: [user],
      });
  
      user.teams.push(newTeam._id);
      await user.save();
      await newTeam.save();
  
      res.status(201).json(newTeam);
    } catch (error) {
      res.status(500).json('Error: ' + error);
    }
  });
  

// Add a member to a team
router.put('/:teamId/add-member', async (req, res) => {
  const { teamId } = req.params;
  const { userId, adminId } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json('Team not found');
    }

    if (team.admin.toString() !== adminId) {
      return res.status(403).json('Only the admin can add members');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json('User not found');
    }

    team.members.push(userId);
    user.teams.push(teamId);
    await team.save();
    await user.save();

    res.status(200).json('User added to the team');
  } catch (error) {
    res.status(500).json('Error: ' + error);
  }
});

// List teams for a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate('teams');
    if (!user) {
      return res.status(404).json('User not found');
    }

    res.status(200).json(user.teams);
  } catch (error) {
    res.status(500).json('Error: ' + error);
  }
});

// Delete a team
router.delete('/:teamId', async (req, res) => {
  const { teamId } = req.params;
  const { adminId } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json('Team not found');
    }

    if (team.admin.toString() !== adminId) {
      return res.status(403).json('Only the admin can delete the team');
    }

    await Promise.all(team.members.map(async (memberId) => {
      const member = await User.findById(memberId);
      member.teams.pull(teamId);
      await member.save();
    }));

    await Team.findByIdAndDelete(teamId);
    res.status(200).json('Team deleted');
  } catch (error) {
    res.status(500).json('Error: ' + error);
  }
});

module.exports = router;