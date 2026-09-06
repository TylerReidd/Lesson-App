import express from 'express'
import { isAuthenticated, isTeacher } from '../middleware/auth.js'
import {teacherHasStudent} from '../middleware/hasStudent.js'
import User from '../models/User.js';
import Question from '../models/Question.js'
import Resource from '../models/Resource.js'
import PracticeLog from '../models/PracticeLog.js';
import LessonNote from '../models/LessonNote.js';
import { linkStudentByEmail } from '../controllers/teacherController.js';

const router = express.Router()

router.post(
  '/students/link',
  isAuthenticated,
  isTeacher,
  linkStudentByEmail
);


router.get('/students',isAuthenticated,isTeacher, async (req,res,next) => {
  try {
    const students = await User.find({role: 'student', assignedTeacher: req.user.id})
    .select('_id name email');
    res.json({students});
  } catch (e) { next(e)}
});

// per student summaries
router.get('/students/:studentId/summary',
  isAuthenticated,
  isTeacher, 
  teacherHasStudent,
  async(req,res,next) => {
    try {
      const {studentId} = req.params;
      const teacherId = req.user.id;

      const [qCount, vCount, aCount, lastQ] = await Promise.all([
        Question.countDocuments({teacher: req.user.id, student: studentId, answer: ''}),
        Resource.countDocuments({ 
          type: 'video',
          $or: [
            { owner: teacherId, recipient: studentId},
            {owner: studentId, recipient: teacherId}
          ],
        }),
        Resource.countDocuments({owner: req.user.id, recipient: studentId, type: 'assignment'}),
        Question.findOne({teacher: req.user.id, student: studentId}).sort({createdAt: -1}).select('createdAt')

      ])
      res.json({
        questionsUnanswered: qCount, 
        videos: vCount, 
        assignments: aCount, 
        lastQuestionAt: lastQ?.createdAt ?? null
      })
    } catch (e) {
      next(e)
    }
  }
)
router.get('/inbox',isAuthenticated,isTeacher, async (req,res,next) => {
  try {
    const teacher = req.user.id;
    
    const[questions, videos, logs] = await Promise.all([
      Question.countDocuments({teacher, unreadForTeacher: true}),
      Resource.countDocuments({recipient: teacher, type: 'video', unreadForTeacher: true}),
      PracticeLog.countDocuments({teacher, unreadForTeacher: true})
    ])
    
    res.json({
      questions,
      videos,
      PracticeLog: logs,
      total: questions + videos + logs
    })
  } catch (e) {next(e)}
})


router.get('/students/:studentId/questions', 
isAuthenticated, isTeacher, teacherHasStudent,
async (req, res,next) => {
  try {
    const items = await Question.find({teacher: req.user.id, student: req.params.studentId})
    .sort('-createdAt')
    .populate('student', 'name')
    await Question.updateMany(
      {teacher: req.user.id, unreadForTeacher: true},
      {$set: {unreadForTeacher: false}}
    )
  res.json({questions: items})
  } catch (e) {next(e)}
})

//per student videos

router.get('/students/:studentId/videos', 
isAuthenticated, isTeacher,teacherHasStudent,
async(req,res,next) => {
  try {
    const {studentId} = req.params;
    const teacherId = req.user.id;

    const items = await Resource.find({
      type: 'video',
      $or: [
        {owner: teacherId, recipient: studentId},
        {owner: studentId, recipient: teacherId},
      ],
    }).sort('-createdAt')

    await Resource.updateMany(
      {
        type: 'video',
        owner: studentId,
        recipient: teacherId,
        unreadForTeacher: true
      },
      {$set: {unreadForTeacher: false}}
    )

    res.json({videos: items})
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

router.get('/students/:studentId',
isAuthenticated,
isTeacher,
teacherHasStudent,
async (req,res,next) => {
  try {
    const {studentId} = req.params;
    const student = await User.findById(studentId).select('_id name email');
    if(!student) {
      return res.status(404).json({message: "student not found" })
    }
    res.json({student})
  } catch (e) {
    next(e)
  }
}
);

router.get(
  '/students/:studentId/notes',
  isAuthenticated,
  isTeacher,
  teacherHasStudent,
  async (req, res, next) => {
    try {
      const notes = await LessonNote.find({
        teacher: req.user.id,
        student: req.params.studentId,
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.json({ notes });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/students/:studentId/notes',
  isAuthenticated,
  isTeacher,
  teacherHasStudent,
  async (req, res, next) => {
    try {
      const title = String(req.body?.title || '').trim();
      const content = String(req.body?.content || '').trim();

      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const note = await LessonNote.create({
        teacher: req.user.id,
        student: req.params.studentId,
        title,
        content,
      });

      res.status(201).json({ note });
    } catch (e) {
      next(e);
    }
  }
);

router.put(
  '/students/:studentId/notes/:noteId',
  isAuthenticated,
  isTeacher,
  teacherHasStudent,
  async (req, res, next) => {
    try {
      const title = String(req.body?.title || '').trim();
      const content = String(req.body?.content || '').trim();

      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const note = await LessonNote.findOneAndUpdate(
        {
          _id: req.params.noteId,
          teacher: req.user.id,
          student: req.params.studentId,
        },
        { title, content },
        { new: true, runValidators: true }
      );

      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.json({ note });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/students/:studentId/notes/:noteId',
  isAuthenticated,
  isTeacher,
  teacherHasStudent,
  async (req, res, next) => {
    try {
      const note = await LessonNote.findOneAndDelete({
        _id: req.params.noteId,
        teacher: req.user.id,
        student: req.params.studentId,
      });

      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.json({ message: 'Note deleted' });
    } catch (e) {
      next(e);
    }
  }
);

export default router
