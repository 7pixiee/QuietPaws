const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Connect to SQLite, create tables, and seed initial data
require('./db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Mount the 5 REST routes (supporting both / and /api base prefixes)
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/sessions', sessionRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/sessions', sessionRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;
