// routes/auth.js
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User.js';
import { signup, logout, me, getUserByEmail, linkTeacher } from '../controllers/authController.js';
import { isAuthenticated, isStudent } from '../middleware/auth.js';


const router = express.Router();

// PUBLIC ROUTES
router.get('/user', getUserByEmail)

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // find & verify
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)   return res.status(401).json({ message: 'Invalid credentials' });

    // sign & set cookie
    const token = jwt.sign({ id: user._id, role: user.role },
                             process.env.JWT_SECRET,
                           { expiresIn: '1d' }
                        );
    
    res.cookie('token', token, {
                httpOnly: true,
                secure: true,     // Changed from process.env... to secure true
                sameSite: 'none', //if same site none
                path: '/',        //you must open to all paths
                maxAge: 24*60*60*1000
              })

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
});

router.put('/me/teacher', isAuthenticated, isStudent, linkTeacher)


router.post('/signup', signup);

// PROTECTED ROUTES
router.get('/me', isAuthenticated, me)
router.post('/logout', logout);


export default router
