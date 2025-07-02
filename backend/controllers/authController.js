const User    = require('../models/User');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

const createToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await new User({ name, email, password: hashed }).save();
    const token  = createToken(user);

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: 'User created successfully',
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: 'Login successful',
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// clear the cookie on logout
exports.logout = (req, res) => {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    })
    .status(200)
    .json({ message: 'Logged out successfully' });
};

// return the logged-in user (req.user set by middleware)
exports.me = (req, res) => {
  res.json({ user: req.user });
};
