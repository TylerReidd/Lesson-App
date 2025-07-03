const express = require('express');
const { isAuthenticated, isStudent, isTeacher } = require('../middleware/auth');
const { getAssignments, uploadAssignment } = require('../controllers/resourceController');
const {getPrivateVideos, uploadVideo} = require('../controllers/resourceController');
const {getPublicVideos} = require('../controllers/resourceController')
const multer = require('multer')

const router = express.Router();

const upload = multer({dest: 'uploads/'})

// only students should fetch their assignments
router.get(
  '/assignments/upload',
  isAuthenticated,
  isStudent,
  getAssignments
);

router.post(
  '/assignments/upload',
  isAuthenticated,
  isTeacher,
  upload.single('file'),
  uploadAssignment
)


// Post private video for student
router.post(
  '/videos/upload',
  isAuthenticated,
  isTeacher,
  upload.single('file'),
  uploadVideo
)


// Students can GET video
router.get(
  '/videos/private',
  isAuthenticated,
  isStudent,
  getPrivateVideos
)


router.get(
  '/videos/public',
  getPublicVideos
)

module.exports = router;
