const express = require('express');
const { completeSession } = require('../controllers/sessionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/complete', completeSession);

module.exports = router;
