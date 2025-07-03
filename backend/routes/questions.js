const express = require('express')
const {isAuthenticated, isStudent} = require('../middleware/auth')
const {postQuestion, getMyQuestions} = require('../controllers/questionController')

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

module.exports = router;