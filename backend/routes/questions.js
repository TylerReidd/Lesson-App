import express from 'express'
import  {isAuthenticated, isStudent, isTeacher} from '../middleware/auth.js'
import {postQuestion, getMyQuestions, getAllQuestions, respondToQuestion, deleteQuestion} from '../controllers/questionController.js'
import Question from '../models/Question.js'

const router = express.Router()

//student post question
router.post(
  '/',
  isAuthenticated,
  isStudent,
  postQuestion
)

router.get(
  '/me',
  isAuthenticated,
  isStudent,
  getMyQuestions
)

router.get(
  '/teacher',
  isAuthenticated,
  isTeacher,
  async (req,res,next) => {
    try {
      const {studentId} = req.query;
      const q = {teacher: req.user.id};
      if(studentId) q.student = studentId;
      const items = await Question.find(q).sort({createdAt: -1})
      res.json({questions: items})
    } catch (e) {next(e)}
  }
  )

router.put(
  '/:id/respond', 
  isAuthenticated,
  isTeacher, 
  respondToQuestion
  )


  router.delete('/:id', isAuthenticated, isStudent, deleteQuestion)

export default router