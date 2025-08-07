// routes/resources.js
import express from 'express';
import Resource from '../models/Resource.js';
import { isAuthenticated, isStudent, isTeacher } from '../middleware/auth.js';
import {
  getAssignments,
  uploadAssignment,
  getPrivateVideos,
  getPublicVideos,
  uploadVideo,
  deleteAssignment
} from '../controllers/resourceController.js';
import { uploadPdf, uploadVideo as uploadVideoMW } from '../middleware/upload.js';

const router = express.Router();

// PDF routes
router.get(
  '/assignments',
  isAuthenticated, 
  // isStudent,

  getAssignments
);
router.post(
  '/assignments/upload',
  isAuthenticated, isTeacher,
  uploadPdf.single('file'),
  uploadAssignment
);

// Video routes
router.get(
  '/videos/private',
  isAuthenticated, isStudent,
  getPrivateVideos
);
router.get(
  '/videos/public',
  getPublicVideos
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
  '/videos/upload',
  isAuthenticated, isTeacher,
  uploadVideoMW.single('file'),
  uploadVideo
);

router.delete(
  '/assignments/:id',
  isAuthenticated,
  deleteAssignment
)

export default router;
