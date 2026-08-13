// routes/auth.js
import express from 'express'
import User from '../models/User.js';
import { signup, logout, me, getUserByEmail, linkTeacher, login } from '../controllers/authController.js';
import { isAuthenticated, isStudent, isTeacher } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';


const router = express.Router();
const authWriteRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many auth attempts. Please try again later.',
});

// PUBLIC ROUTES
router.get('/user', isAuthenticated, isTeacher, getUserByEmail)


router.post('/login', authWriteRateLimit, login);

router.put('/me/teacher', isAuthenticated, isStudent, linkTeacher)

router.delete('/me/teacher' , isAuthenticated, isStudent, async(req,res,next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {assignedTeacher: null});
    const updated = await User.findById(req.user.id).select('_id name email role assignedTeacher')
    res.json({user: updated})
  } catch (e) {next(e)}
})


router.post('/signup', authWriteRateLimit, signup);

// PROTECTED ROUTES
router.get('/me', isAuthenticated, async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');
    const user = await User.findById(req.user.id)
      .select('_id name email role assignedTeacher')
      .populate('assignedTeacher', '_id name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

// More detailed profile (shows assignedTeacher)
router.get('/me/full', isAuthenticated, async (req, res, next) => {
  try {
    const raw = await User.findById(req.user.id).select('_id name email role assignedTeacher')
    const populated = await User.findById(req.user.id)
    .select('_id name email role assignedTeacher')
    .populate('assignedTeacher', '_id name email role');
    res.json({
      user: populated,
      assignedTeacherId: raw?.assignedTeacher || null
    })
  } catch (e) {
    next(e);
  }
});


router.post('/logout', logout);



export default router
