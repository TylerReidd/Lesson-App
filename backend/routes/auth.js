// routes/auth.js
const express    = require('express');
const jwt        = require('jsonwebtoken');
const bcrypt     = require('bcrypt');
const User       = require('../models/User');
const { signup, logout, me } = require('../controllers/authController');
const { isAuthenticated }    = require('../middleware/auth');

const router = express.Router();

// 1) Signup (already working)
router.post('/signup', signup);

// 2) Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find & verify
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)   return res.status(401).json({ message: 'Invalid credentials' });

    // sign & set cookie
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',   // or 'none' in prod over HTTPS
      secure: false      // false for dev HTTP
    });

    // return user
    return res.json({
      user: {
        _id:   user._id,
        email: user.email,
        role:  user.role,
        name:  user.name
      },
      message: 'Logged in!'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}); // ← this closes router.post('/login', …)

// 3) Logout (controller or custom)
router.post('/logout', logout);

// 4) “Who am I?” protected route
router.get('/me', isAuthenticated, me);

// 5) Any other helper routes
router.get('/user', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email query is required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      _id:   user._id,
      email: user.email,
      role:  user.role,
      name:  user.name
    });
  } catch (err) {
    console.error('Auth user lookup failed', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// 6) Finally, export the router
module.exports = router;
