// routes/resources.js
import express from 'express';
import Resource from '../models/Resource.js';
import { isAuthenticated, isStudent, isTeacher } from '../middleware/auth.js';
import {
  getAssignments,
  getPrivateVideos,
  deleteAssignment,
  deleteVideo
} from '../controllers/resourceController.js';
import { uploadMiddleware } from '../middleware/upload.js';
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
        uploadedAt: r.createdAt
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
      const url = `/uploads/${file.filename}`;
      const type = file.mimetype.startsWith('video/') ? 'video' : 'assignment';

      const resource = await Resource.create({
        owner:      req.user.id,
        recipient:  studentId,
        filename:   file.originalname,
        url,
        type,
        visibility: 'private'
      });

      console.log('upload handler body=',req.body, 'file=',req.file && req.file.filename)

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
      next(err);
    }
  }
);
router.delete(
  '/assignments/:id',
  isAuthenticated,
  deleteAssignment
)

router.delete(
  '/videos/:id',
  isAuthenticated,
  deleteVideo
)

export default router;
