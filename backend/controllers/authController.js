import User from '../models/User.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const {JWT_SECRET} =process.env

const createToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

export async function signup (req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await new User({ name, email, password: hashed, role }).save();
    const token  = createToken(user);

    res
      .cookie('token', token, {
        httpOnly: true,
        secure:false,
        sameSite: 'none',
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

export async function login (req, res) {
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
        secure: false,
        sameSite: 'none',
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
export async function logout (req, res)  {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
    })
    .status(200)
    .json({ message: 'Logged out successfully' });
};

// return the logged-in user (req.user set by middleware)
export async function me  (req, res) {
  res.json({ user: req.user });
};

export async function getMe  (req,res,next) {
  try {
    const token = req.cookie.token
    if(!token) return res.status(401).json({message: "Not authenticated"})
  
    const payload = jwt.verify(token, JWT_SECRET)
    res.json({userId: payload.userId, role: payload.role})


  } catch (err) {
    next(err)
  }
}

export async function getUserByEmail(req, res, next) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Student not found' });
    res.json({ _id: user._id, email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
}