const db = require('../db');

function createSession(userId, durationMin, intention = null, rewardType = null, rewardId = null) {
  const completedAt = new Date().toISOString();
  const result = db.prepare(`
    INSERT INTO sessions (user_id, duration_min, intention, completed_at, reward_type, reward_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, durationMin, intention, completedAt, rewardType, rewardId);

  return findSessionById(result.lastInsertRowid);
}

function findSessionById(id) {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
}

function countCompletedSessions(userId) {
  const row = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE user_id = ?').get(userId);
  return row ? row.count : 0;
}

module.exports = {
  createSession,
  findSessionById,
  countCompletedSessions
};
