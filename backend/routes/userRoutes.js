const express = require('express');
const { getProfile, getRewards } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', getProfile);
router.get('/rewards', getRewards);

module.exports = router;
