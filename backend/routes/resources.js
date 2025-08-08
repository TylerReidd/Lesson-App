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
  getAssignments
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
      const list = await Resource.find({
        owner: req.user.id,
        type: 'video',
      }).sort('-createdAt');
      res.json(list.map(r => ({
        id: r._id,
        filename: r.filename,
        url: r.url,
        uploadedAt: r.createdAt,
        owner: r.owner?.toString(),
        recipient: r.recipient?.toString(),
      })))
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


      res.status(201).json({
        message: "Upload Successful",
        video: {
          id:         resource._id,
          filename:   resource.filename,
          url:        resource.url,
          uploadedAt: resource.createdAt
        }
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
