const { findUserById, updateUserStreak } = require('../models/userModel');
const { createSession, countCompletedSessions } = require('../models/sessionModel');
const { unlockNextCollectible } = require('../models/rewardModel');

function getYYYYMMDD(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function completeSession(req, res) {
  const userId = req.userId;
  const { durationMin, intention } = req.body;

  if (!durationMin || typeof durationMin !== 'number' || durationMin <= 0) {
    return res.status(400).json({ error: 'Valid durationMin (positive number) is required' });
  }

  const user = findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 1. Calculate streak logic
  const today = new Date();
  const todayStr = getYYYYMMDD(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getYYYYMMDD(yesterday);

  const lastDay = user.last_completed_day;

  let newStreak = 1;
  if (lastDay === yesterdayStr) {
    newStreak = user.current_streak + 1;
  } else if (lastDay === todayStr) {
    newStreak = user.current_streak; // Same day completion keeps streak
  } else {
    newStreak = 1; // Missed a day or first completion
  }

  const newBestStreak = Math.max(user.best_streak || 0, newStreak);
  updateUserStreak(userId, newStreak, newBestStreak, todayStr);

  // 2. Count total completed sessions (including this new one)
  const previousCount = countCompletedSessions(userId);
  const totalCompletedCount = previousCount + 1;

  // 3. Strict alternation: Odd count -> 'cat', Even count -> 'piece'
  const preferredType = (totalCompletedCount % 2 !== 0) ? 'cat' : 'piece';

  // 4. Unlock next item in preferred pool (with fallback to alternative pool)
  const unlockedItem = unlockNextCollectible(userId, preferredType);

  // 5. Insert session row
  const rewardType = unlockedItem ? unlockedItem.type : null;
  const rewardId = unlockedItem ? unlockedItem.id : null;
  createSession(userId, durationMin, intention, rewardType, rewardId);

  // 6. Format reward output
  const rewardResponse = unlockedItem ? {
    type: unlockedItem.type,
    name: unlockedItem.name,
    detail: unlockedItem.detail,
    image_url: unlockedItem.image_url
  } : null;

  res.status(200).json({
    newStreak,
    reward: rewardResponse
  });
}

module.exports = {
  completeSession
};
