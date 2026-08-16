const { findUserById } = require('../models/userModel');
const { countCompletedSessions } = require('../models/sessionModel');
const { getFullRewardsCatalog } = require('../models/rewardModel');

async function getProfile(req, res) {
  try {
    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalSessions = await countCompletedSessions(req.userId);

    res.status(200).json({
      name: user.name,
      email: user.email,
      streak: {
        current: user.current_streak,
        best: user.best_streak
      },
      totalSessions
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getRewards(req, res) {
  try {
    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const rewards = await getFullRewardsCatalog(req.userId);
    res.status(200).json(rewards);
  } catch (err) {
    console.error("Get rewards error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getProfile,
  getRewards
};
