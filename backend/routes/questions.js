import express from 'express'
import  {isAuthenticated, isStudent, isTeacher} from '../middleware/auth.js'
import {postQuestion, getMyQuestions, getAllQuestions, respondToQuestion} from '../controllers/questionController.js'

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
  getAllQuestions
  )

router.put(
  '/:id/respond', 
  isAuthenticated,
  isTeacher, 
  respondToQuestion
  )

export default router