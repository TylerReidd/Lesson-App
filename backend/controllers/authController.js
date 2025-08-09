// authController.js
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';
const cookieOptsBase = {
  httpOnly: true,
  secure: isProd,                // required on Render (HTTPS)
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
}

export async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await new User({ name, email, password: hashed, role }).save();

    const payload = {
      id: user._id,
      role: user.role,                 // fixed (was userrole)
      assignedTeacher: user.assignedTeacher,
    };

    const token = signToken(payload);

    // Set cookie + ALSO return token in body for mobile Bearer fallback
    res
      .cookie('token', token, { ...cookieOptsBase, maxAge: 24 * 60 * 60 * 1000 })
      .status(201)
      .json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          assignedTeacher: user.assignedTeacher,
        },
      });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = {
      id: user._id,
      role: user.role,
      assignedTeacher: user.assignedTeacher,
    };
    const token = signToken(payload);

    res
      .cookie('token', token, { ...cookieOptsBase, maxAge: 24 * 60 * 60 * 1000 })
      .status(200)
      .json({
        message: 'Login successful',
        token, // <-- return token for mobile header auth
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          assignedTeacher: user.assignedTeacher,
        },
      });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

export async function logout(req, res) {
  res
    .clearCookie('token', cookieOptsBase)
    .status(200)
    .json({ message: 'Logged out successfully' });
}

export async function me(req, res) {
  // req.user is set by auth middleware
  return res.json({
    id: req.user.id,
    role: req.user.role,
    assignedTeacher: req.user.assignedTeacher,
  });
}

export async function linkTeacher(req, res, next) {
  try {
    const { teacherEmail } = req.body;
    if (!teacherEmail) {
      return res.status(400).json({ message: 'Teacher email is required.' });
    }
    const teacher = await User.findOne({ email: teacherEmail, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: 'No teacher found with that email.' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      assignedTeacher: teacher._id,
    }, { new: true });

    const updated = await User.findById(req.user.id).select('-password');
    res.json({ user: updated });
  } catch (err) {
    next(err);
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
