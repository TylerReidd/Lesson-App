const express = require('express');
const path = require('path')
const multer = require('multer')
const { isAuthenticated, isStudent, isTeacher } = require('../middleware/auth');
const { getAssignments, uploadAssignment } = require('../controllers/resourceController');
const {getPrivateVideos, uploadVideo} = require('../controllers/resourceController');
const {getPublicVideos} = require('../controllers/resourceController')
const Video = require('../models/Video')

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req,file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}${ext}`)
  }
})

const upload = multer ({storage})


// GET student videos /api/resources/videos?recipent=studentStuff
router.get('/videos', async (req,res) => {
  try {
    const {userId} = req.query;
    if(!userId) {
      return res.status(400).json({error: "field cant be empty"})
    }

    const vids = await Video.find({recipient: userId})
    .sort({uploadedAt: -1})
    .select('filename uploadedAt')

    const host = `${req.protocol}://${req.get("host")}`
    const list = vids.map(v => ({
      id: v._id,
      name: v.filename,
      url: `${host}/uploads/${v.filename}`,
      uploadedAt: v.uploadedAt,
    }))
    res.json(list)
  } catch (err) {
    console.error("error fetching student videos", err)
    res.status(500).json({error: "Server error"})
  }
})

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
