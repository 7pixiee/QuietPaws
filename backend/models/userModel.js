const db = require('../db');

async function findUserByEmail(email) {
  const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

async function findUserById(id) {
  const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function createUser(name, email, passwordHash) {
  const res = await db.query(
    `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING *
  `,
    [name, email, passwordHash]
  );

  return res.rows[0];
}

async function updateUserStreak(userId, currentStreak, bestStreak, todayStr) {
  const res = await db.query(
    `
    UPDATE users
    SET current_streak = $1,
        best_streak = $2,
        last_completed_day = $3
    WHERE id = $4
    RETURNING *
  `,
    [currentStreak, bestStreak, todayStr, userId]
  );

  return res.rows[0];
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserStreak
};
