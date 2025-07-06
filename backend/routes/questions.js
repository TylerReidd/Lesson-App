import express from 'express'
import  {isAuthenticated, isStudent} from '../middleware/auth.js'
import {postQuestion, getMyQuestions} from '../controllers/questionController.js'

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

export default router