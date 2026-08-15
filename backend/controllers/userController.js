const { findUserById } = require('../models/userModel');
const { countCompletedSessions } = require('../models/sessionModel');
const { getFullRewardsCatalog } = require('../models/rewardModel');

function getProfile(req, res) {
  const user = findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const totalSessions = countCompletedSessions(req.userId);

  res.status(200).json({
    name: user.name,
    email: user.email,
    streak: {
      current: user.current_streak,
      best: user.best_streak
    },
    totalSessions
  });
}

function getRewards(req, res) {
  const user = findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const rewards = getFullRewardsCatalog(req.userId);
  res.status(200).json(rewards);
}

module.exports = {
  getProfile,
  getRewards
};
