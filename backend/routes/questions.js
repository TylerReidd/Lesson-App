import express from 'express'
import  {isAuthenticated, isStudent, isTeacher} from '../middleware/auth.js'
import {postQuestion, getMyQuestions, getAllQuestions, respondToQuestion, deleteQuestion} from '../controllers/questionController.js'
import Question from '../models/Question.js'
import Thread from '../models/Thread.js' 
import Message from '../models/Message.js'
import { uploadMiddleware } from '../middleware/upload.js';
import { fileUrl } from '../utils/urls.js';


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
  '/teacher/pending',
  isAuthenticated,
  isTeacher,
  async (req,res,next) => {
    try {
      const count = await Question.countDocuments({
        teacher: req.user.id,
        answer: ""
      })
      res.json({pending: count})
    } catch (e) {
      next(e)
    }
  }
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
      await Question.updateMany(
        {teacher: req.user.id, unreadForTeacher: true},
        {$set: {unreadForTeacher: false}}
      )
      res.json({questions: items})
    } catch (e) {next(e)}
  }
  )

  const replyUpload = uploadMiddleware.array('attachments', 5);

  router.post(
    '/:id/replies',
    isAuthenticated,
    replyUpload,
    async (req,res,next) => {
      try {
        const {id} = req.params;
        const text = (req.body?.text || "").trim();

        const filesRaw = Array.isArray(req.files)
          ? req.files
          : Array.isArray(req.files?.attachments)
          ? req.files.attachments
          : [];

        if(!text && filesRaw.length === 0) {
          return res.status(400).json({message: 'Reply text or attachment is required'});
        }

        const q = await Question.findById(id).select('student teacher')
        if(!q) return res.status(404).json({message: 'Question not found'});

        const me = String(req.user.id);

        const isStudent = me === String(q.student);
        const isTeacher = me === String(q.teacher)
        if(!isStudent && !isTeacher) {
          return res.status(403).json({message: 'Not authorized to reply to this question'})
        }

          let thread = await Thread.findOne({question: q._id})
          if (!thread) {
            thread = await Thread.create({
              question: q._id,
              student:q.student, 
              teacher: q.teacher,
              lastActivity: new Date(),
            })
          }

          const role = isTeacher ? 'teacher' : 'student';
          const attachments = filesRaw.map((file) => ({
            filename: file.originalname,
            url: fileUrl(file.filename),
            mimetype: file.mimetype,
            size: file.size
          }));

          const msg = await Message.create({
            thread: thread._id,
            sender: req.user.id,
            role,
            text,
            attachments,
            unreadForTeacher: role === 'student',
            unreadForStudent: role === 'teacher',
          })
          await Thread.updateOne({_id:thread._id}, { $set: {lastActivity: new Date()}})

          await Question.updateOne(
            {_id: q._id},
            {
              $set: {
                unreadForTeacher: isStudent,
                unreadForStudent: isTeacher,
              }
            }
          );

          res.status(201).json({message: {
            id: msg._id, 
            text: msg.text, 
            createdAt: msg.createdAt, 
            authorRole: role,
            attachments: msg.attachments || []
          }})
        } catch (e) {next(e)}
      }
  )

  router.get('/:id/replies', isAuthenticated, async (req, res, next) => {
    try {
      const { id } = req.params;
  
      // Access check
      const q = await Question.findById(id).select('student teacher');
      if (!q) return res.status(404).json({ message: 'Question not found' });

      const me = String(req.user.id);

      const canView = me === String(q.student) || me === String(q.teacher);
      if (!canView) return res.status(403).json({ message: 'Forbidden' });
  
      // Find thread by question link (preferred). If you didn't add `question` to Thread,
      // fall back to student/teacher pairing.
      let thread = await Thread.findOne({ question: q._id });
      if (!thread) {
        thread = await Thread.findOne({ student: q.student, teacher: q.teacher });
      }
      if (!thread) return res.json({ replies: [] });
  
      const msgs = await Message.find({ thread: thread._id })
        .sort('createdAt');
  
      // Normalize shape for your UI: authorRole + createdAt + text
      const replies = msgs.map(m => ({
        id: m._id,
        text: m.text,
        createdAt: m.createdAt,
        authorRole: m.role,
        attachments: Array.isArray(m.attachments) ? m.attachments : []
      }));
  
      res.json({ replies });
    } catch (e) { next(e); }
  });

router.put(
  '/:id/respond', 
  isAuthenticated,
  isTeacher, 
  respondToQuestion
  )


router.delete('/:id', isAuthenticated, isStudent, deleteQuestion)

export default router
