import express from 'express'
import {isAuthenticated, isStudent, isTeacher} from '../middleware/auth.js';
import { createPractice, createPracticeClip, getMyPractice, getStudentPracticeForTeacher, updatePracticeClipLibrary } from '../controllers/practiceController.js';
import PracticeLog from '../models/PracticeLog.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router()

router.post('/', isAuthenticated, isStudent, createPractice)
router.post('/clip', isAuthenticated, isStudent, uploadMiddleware.single('clip'), createPracticeClip)
router.get('/me', isAuthenticated, isStudent, getMyPractice)
router.put('/:id/library', isAuthenticated, isStudent, updatePracticeClipLibrary)

router.put('/:id/review', isAuthenticated, isTeacher, async (req,res, next) => {
  try {
    const {status, teacherComment} = req.body;
    if (!['submitted', 'approved', 'needs attention'].includes(status)) {
      return res.status(400).json({message: 'Invalid practice review status'});
    }
    const log = await PracticeLog.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.id },
      { status, teacherComment, unreadForStudent: true, unreadForTeacher: false },
      {new: true, runValidators: true}
    );
    if(!log) return res.status(404).json({message: 'Practice log not found'});
    res.json({ log });
  }
  catch (e) {next(e)}
});

router.get('/teacher/:studentId', isAuthenticated, isTeacher, getStudentPracticeForTeacher)

export default router
