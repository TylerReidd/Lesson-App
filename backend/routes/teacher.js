import express from 'express'
import { isAuthenticated, isTeacher } from '../middleware/auth.js'
import {teacherHasStudent} from '../middleware/hasStudent.js'
import User from '../models/User.js';
import Question from '../models/Question.js'
import Resource from '../models/Resource.js'

const router = express.Router()


router.get('/students',isAuthenticated,isTeacher, async (req,res,next) => {
  try {
    const students = await User.find({role: 'student', assignedTeacher: req.user.id})
    .select('_id name email');
    res.json({students});
  } catch (e) { next(e)}
});

// per student summaries
router.get('/students/:studentId/summary',
  isAuthenticated, isTeacher, teacherHasStudent,
  async(req,res,next) => {
    try {
      const {studentId} = req.params;
      const [qCount, vCount, aCount, lastQ] = await Promise.all([
        Question.countDocuments({teacher: req.user.id, student: studentId}),
        Resource.countDocuments({owner: req.user.id, recipient: studentId, type: 'video'}),
        Resource.countDocuments({owner: req.user.id, recipient: studentId, type: 'assignment'}),
        Question.findOne({teacher: req.user.id, student: studentId}).sort({createdAt: -1}).select('createdAt')

      ])
      res.json({questions: qCount, videos: vCount, assignments: aCount, lastQuestionAt: lastQ?.createdAt ?? null})
    } catch (e) {
      next(e)
    }
  }
)

router.get('/students/:studentId/questions', 
isAuthenticated, isTeacher, teacherHasStudent,
async (req, res,next) => {
  try {
    const items = await Question.find({teacher: req.user.id, student: req.params.studentId})
    .sort('-createdAt')
    .populate('student', 'name')
  res.json({questions: items})
  } catch (e) {next(e)}
})

//per student videos

router.get('/students/:studentId/videos', 
isAuthenticated, isTeacher,teacherHasStudent,
async(req,res,next) => {
  try {
    const items = await Resource.find({
      owner: req.user.id, recipient: req.params.studentId, type: 'video'
    }).sort('-createdAt')
    res.json({videos: items});
  } catch (e) {next(e)}
})

router.get('/students/:studentId/assignments', 
isAuthenticated, isTeacher, teacherHasStudent,
async(req,res,next) => {
  try {
    const items = await Resource.find({
    owner: req.user.id, recipient: req.params.studentId, type: 'assignment'
  }).sort('-createdAt');
  res.json({assignments: items})
} catch(e) {next(e)}
})

export default router