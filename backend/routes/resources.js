const express = require('express');
const { isAuthenticated, isStudent } = require('../middleware/auth');
const { getAssignments } = require('../controllers/resourceController');

const router = express.Router();

// only students should fetch their assignments
router.get(
  '/assignments',
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

module.exports = router;
