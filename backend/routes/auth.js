const express = require('express');
const { signup, login, logout, me } = require('../controllers/authController');
const {isAuthenticated} = require('../middleware/auth') // see below
const User = require('../models/User')
const router = express.Router();

router.post('/signup', signup);
router.post('/login',  login);
router.post('/logout', logout);
router.get('/me', isAuthenticated, me);

router.get("/user", async (req, res) => {
  const {email} = req.query
  if(!email) {
    return res.status(400).json({error: "email query is required"})
  }
  try {
    const user = await User.findOne({email})
    if (!user) {
      return res.status(404).json({error: "User not found"})
    }
    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    })
  } catch (err) {
    console.error("Auth user lookup failed", err)
    res.status(500).json({error: "Server error"})
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax'
  })
  res.json({message: "logged out"})
})

module.exports = router;
