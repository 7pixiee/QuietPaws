const db = require('../db');

async function createSession(userId, durationMin, intention = null, rewardType = null, rewardId = null) {
  const completedAt = new Date().toISOString();
  const res = await db.query(
    `
    INSERT INTO sessions (user_id, duration_min, intention, completed_at, reward_type, reward_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
    [userId, durationMin, intention, completedAt, rewardType, rewardId]
  );

  return res.rows[0];
}

async function findSessionById(id) {
  const res = await db.query('SELECT * FROM sessions WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function countCompletedSessions(userId) {
  const res = await db.query('SELECT COUNT(*)::int as count FROM sessions WHERE user_id = $1', [userId]);
  return res.rows[0] ? parseInt(res.rows[0].count, 10) : 0;
}

module.exports = {
  createSession,
  findSessionById,
  countCompletedSessions
};
