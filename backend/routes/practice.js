import express from 'express'
import {isAuthenticated, isStudent, isTeacher} from '../middleware/auth.js';
import { createPractice, getMyPractice, getStudentPracticeForTeacher } from '../controllers/practiceController.js';
import PracticeLog from '../models/PracticeLog.js';

const router = express.Router()

router.post('/', isAuthenticated, isStudent, createPractice)
router.get('/me', isAuthenticated, isStudent, getMyPractice)

router.put('/:id/review', isAuthenticated, isTeacher, async (req,res, next) => {
  try {
    const {status, teacherComment} = req.body;
    const log = await PracticeLog.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.id },
      { status, teacherComment, unreadForStudent: true, unreadForTeacher: false },
      {new: true}
    );
    if(!log) return res.status(404).json({message: 'Practice log not found'});
    res.json({ log });
  }
  catch (e) {next(e)}
});

router.get('/teacher/:studentId', isAuthenticated, isTeacher, getStudentPracticeForTeacher)

export default router