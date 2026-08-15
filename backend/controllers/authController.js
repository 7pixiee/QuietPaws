const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../models/userModel');

async function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser(name, email, passwordHash);

  const secret = process.env.JWT_SECRET || 'quietpaws_final_super_secret_jwt_key_2026';
  const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '30d' });

  res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const secret = process.env.JWT_SECRET || 'quietpaws_final_super_secret_jwt_key_2026';
  const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '30d' });

  res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
}

module.exports = {
  signup,
  login
};
