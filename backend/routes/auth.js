// routes/auth.js
import express from 'express'
import User from '../models/User.js';
import { signup, logout, me, getUserByEmail, linkTeacher, login } from '../controllers/authController.js';
import { isAuthenticated, isStudent, isTeacher } from '../middleware/auth.js';


const router = express.Router();

// PUBLIC ROUTES
router.get('/user', isAuthenticated, isTeacher, getUserByEmail)


router.post('/login', login);

router.put('/me/teacher', isAuthenticated, isStudent, linkTeacher)

router.delete('/me/teacher' , isAuthenticated, isStudent, async(req,res,next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {assignedTeacher: null});
    const updated = await User.findById(req.user.id).select('_id name email role assignedTeacher')
    res.json({user: updated})
  } catch (e) {next(e)}
})


router.post('/signup', signup);

// PROTECTED ROUTES
router.get('/me', isAuthenticated, (req,res) => {
  res.set('Cache-Control', 'no-store')
  res.json({id: req.user.id, role: req.user.role})
})

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
