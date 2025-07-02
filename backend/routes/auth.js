const express = require('express');
const { signup, login, logout, me } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');  // see below
const router = express.Router();

router.post('/signup', signup);
router.post('/login',  login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

module.exports = router;
