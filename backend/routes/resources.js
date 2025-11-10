// routes/resources.js
import express from 'express';
import Resource from '../models/Resource.js';
import { isAuthenticated, isStudent, isTeacher, isTeacherOrStudent } from '../middleware/auth.js';
import {
  getAssignments,
  getPrivateVideos,
  deleteAssignment,
  deleteVideo,
  
} from '../controllers/resourceController.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { fileUrl } from '../utils/urls.js';
import User from '../models/User.js';


const router = express.Router();

// PDF routes
router.get(
  '/assignments',
  isAuthenticated, 
  async (req,res,next) => {
    try {
      if(req.user.role === 'student') {
        const items = await Resource.find({recipient: req.user.id, type: 'assignment'})
        .sort({createdAt: -1})
        return res.json({assignments: items})
      }
      const {studentId} = req.query;
      const q = {owner: req.user.id, type: 'assignment'};
      if (studentId) q.recipient = studentId;
      const items = await Resource.find(q).sort({createdAt: -1})
      res.json({assignments: items})
    } catch (e) {next(e)}
  }
);

router.get(
  '/videos/private',
  isAuthenticated,
  getPrivateVideos
)


router.get(
  '/videos',
  isAuthenticated,
  async( req,res,next) => {
    try {
     let q = {type: 'video'};

     if(req.user.role === 'teacher') {
      q.owner = req.user.id
     } else if (req.user.role === 'student') {
      q.owner = req.user.id
     }
     const items = await Resource.find(q).sort({createdAt: -1})
     res.json({videos: items})

    } catch (err) {
      next(err)
    }
  }
)

router.post(
  '/upload',
  isAuthenticated,
  uploadMiddleware.fields([
    {name: 'file', maxCount: 1},
    {name: "teacherId"},
    {name: 'teacherEmail'},
    {name: 'recipient'},
    {name: 'recipientEmail'},
  ]),
  async (req, res, next) => {
    try {
      console.log("UPLOAD DEBUG:");
      console.log("user:", req.user);
      console.log("body:", req.body);
      console.log("file:", req.files);

      const file = req.files?.file?.[0];
      if (!file) return res.status(400).json({ message: "No file provided" });

      const user = req.user;
      const role = (user.role || "").toLowerCase();
      const url = fileUrl(file.filename);
      const type = file.mimetype.startsWith("video/") ? "video" : "assignment";
      let recipientId;
      const isStudentToTeacher = (role === 'student' && type === 'video');
      const isTeacherToStudent = (role === 'teacher' && (type === 'video' || type === 'assignment'));
      const notifyStudentForAssignment = (role === 'teacher' && type === 'assignment');

      if (role === "teacher") {
        let { recipient, recipientEmail } = req.body;
        if (!recipient && recipientEmail) {
          const student = await User.findOne({ email: recipientEmail, role: "student" });
          if (!student) return res.status(404).json({ message: "student not found" });
          recipient = student._id.toString();
        }
        if (!recipient) return res.status(400).json({ message: "Missing recipient ID or email" });
        recipientId = recipient;

      } else if (role === "student") {
        let { teacherId, teacherEmail } = req.body;
        if (!teacherId && teacherEmail) {
          const teacher = await User.findOne({ email: teacherEmail, role: "teacher" });
          if (!teacher) return res.status(404).json({ message: "teacher not found" });
          teacherId = teacher._id.toString();
        }
        if (!teacherId) return res.status(400).json({ message: "Missing teacher ID or email" });
        recipientId = teacherId;

      } else {
        return res.status(403).json({ message: "Invalid role for upload" });
      }

      const resource = await Resource.create({
        owner: user.id || user._id,
        recipient: recipientId,
        filename: file.originalname,
        url,
        type,
        visibility: "private",
        unreadForTeacher: !!isStudentToTeacher,
        unreadForStudent: !!(isTeacherToStudent || notifyStudentForAssignment),
      });

      res.status(201).json({
        message: "Upload Successful!",
        resource: {
          id: resource._id || resource.id,
          filename: resource.filename,
          url: resource.url,
          uploadedAt: resource.createdAt,
          type: resource.type,
        },
      });
    } catch (err) {
      console.error("💥 Upload error:", err);
      console.error("💥 Stack:", err?.stack);
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  }
);

// router.get('/mine', isAuthenticated, async (req,res,next) => {
//   try {
//     const resources = await Resource.find({
//       owner: req.user._id || req.user.id,
//       type: 'video',
//     }).sort({createdAt: -1})

//     res.json(resources)
//   } catch (err) {
//     next(err)
//   }
// })

// router.get('/to-me', isAuthenticated, asyn)



router.delete(
  '/assignments/:id',
  isAuthenticated,
  isTeacherOrStudent,
  deleteAssignment
)

router.delete(
  '/videos/:id',
  isAuthenticated,
  isTeacherOrStudent,
  deleteVideo
)


export default router;
