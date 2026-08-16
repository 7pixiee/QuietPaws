const db = require('../db');

function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function createUser(name, email, passwordHash) {
  const result = db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES (?, ?, ?)
  `).run(name, email, passwordHash);

  return findUserById(result.lastInsertRowid);
}

function updateUserStreak(userId, currentStreak, bestStreak, todayStr) {
  db.prepare(`
    UPDATE users
    SET current_streak = ?,
        best_streak = ?,
        last_completed_day = ?
    WHERE id = ?
  `).run(currentStreak, bestStreak, todayStr, userId);

  return findUserById(userId);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserStreak
};
