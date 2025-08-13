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
      const {studentId} = req.query;
      const q = {owner: req.user.id, type: 'video'}
      if(studentId) q.recipient = studentId;
      const items = await Resource.find(q).sort({ createdAt: - 1 });
      res.json({videos: items})
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  '/upload',
  isAuthenticated, isTeacher,
  uploadMiddleware.single('file'),
  async (req, res, next) => {
    try {
      const file     = req.file;
      console.log(("[UPLOAD] hit /api/resources/upload"))
      console.log("[UPLOAD] content-type=", req.headers["content-type"]);
      console.log("[UPLOAD] req.file?", !!file, file?.fieldname, file?.mimetype, file?.filename);
      console.log("[UPLOAD] req.body keys:", Object.keys(req.body || {}));
      let studentId = req.body.recipient;
      const recipientEmail = req.body.recipientEmail;
      if(!file) {
        return res.status(400).json({message: "No file provided"})
      }

      if(!studentId && recipientEmail) {
        const student = await User.findOne({email: recipientEmail, role: 'student'})
        if(!student) return res.status(404).json({message: "student not found"})
        studentId = student._id.toString()
      }
      if(!studentId) {
        return res.status(400).json({message: "No file or recipient"})
      }

      // build URL relative to /uploads
      const url = fileUrl(file.filename);
      const type = file.mimetype.startsWith('video/') ? 'video' : 'assignment';

      const resource = await Resource.create({
        owner:      req.user.id,
        recipient:  studentId,
        filename:   file.originalname,
        url,
        type,
        visibility: 'private'
      });

      console.log('[UPLOAD] saved as:', resource._id.toString(), url);

      const payload = {
        id: resource.id,
        filename: resource.filename,
        url: resource.url,
        uploadedAt: resource.createdAt,
        type: resource.type
      }
      res.status(201).json({
        message: "Upload Successful",
        resource: payload, 
        ...(resource.type === 'video' 
        ? {video: payload}
        : {assignment: payload})
      });
    } catch (err) {
      console.error("UPLOAD: error", err?.stack || err)
      next(err);
    }
  }
);
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
