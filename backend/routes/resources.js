// routes/resources.js
import express from 'express';
import Resource from '../models/Resource.js';
import { isAuthenticated, isStudent, isTeacher } from '../middleware/auth.js';
import {
  getAssignments,
  getPrivateVideos,
  getPublicVideos,
  deleteAssignment
} from '../controllers/resourceController.js';
import { uploadMiddleware } from '../middleware/upload.js';


const router = express.Router();

// PDF routes
router.get(
  '/assignments',
  isAuthenticated, 
  getAssignments
);


router.get(
  '/videos',
  isAuthenticated,
  isTeacher,
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
      const { file }      = req;
      const { recipient } = req.body;
      if (!file)      return res.status(400).json({ message: "No file provided" });
      if (!recipient) return res.status(400).json({ message: "No recipient" });

      // build URL relative to /uploads
      const url = `/uploads/${file.filename}`;
      const type = file.mimetype.startsWith('video/') ? 'video' : 'assignment';

      const resource = await Resource.create({
        owner:      req.user.id,
        recipient,
        filename:   file.originalname,
        url,
        type,
        visibility: 'private'
      });

      res.status(201).json({
        id:         resource._id,
        filename:   resource.filename,
        url:        resource.url,
        uploadedAt: resource.createdAt
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

export default router;
