// routes/resources.js
import express from 'express';
import { isAuthenticated, isStudent, isTeacher } from '../middleware/auth.js';
import {
  getAssignments,
  uploadAssignment,
  getPrivateVideos,
  getPublicVideos,
  uploadVideo
} from '../controllers/resourceController.js';
import { uploadPdf, uploadVideo as uploadVideoMW } from '../middleware/upload.js';

const router = express.Router();

// PDF routes
router.get(
  '/assignments',
  isAuthenticated, isStudent,
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
router.post(
  '/videos/upload',
  isAuthenticated, isTeacher,
  uploadVideoMW.single('file'),
  uploadVideo
);

export default router;
