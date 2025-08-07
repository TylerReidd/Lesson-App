import express from 'express'
// import { upload } from '../middleware/upload.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import Video from '../models/Video.js';
import { isAuthenticated, isTeacher } from '../middleware/auth.js';

const router  = express.Router();

router.post(
  "/video", 
  isAuthenticated, 
  isTeacher,
  uploadVideo.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        console.error("No file recieved by multer")
        return res.status(400).json({error: 'No file recieved'})
      }

      const studentEmail = req.body.recipientEmail
      const student = await User.findOne({ email: studentEmail, role: 'student'})
      if (!student) {
        return res.status(404).json({error: "Student not found"})
      }

      const resource = await Resource.create({
        owner: req.user.id,
        recipient: student._id,
        filename: req.file.originalname,
        url: `/uploads/videos/${req.file.filename}`,
        type: 'video',
        visibility: 'private'
      })
      console.log('Saved to MongoDB', resource._id)

      res.json({
        message: "Upload + dv save successful", 
        video: {
          id: resource._id,
          filename: resource.filename,
          url: `${req.protocol}://${req.get('host')}${resource.url}`,
          uploadedAt: resource.createdAt
        }})
    } catch(dbErr) {
      console.error("DB save failed", dbErr)
      res.status(500).json({error: "Failed to save Video record"})
    }
  })

  // POST PDF Route

  router.post(
    '/pdf',
    isAuthenticated,
    isTeacher,
    uploadPdf.single('file'),
    async (req, res) => {
      if(!req.file) {
        console.error("No PDF Recieved by Multer")
        return res.status(400).json({error: "no file recieved "})
      }

      try {
        const studentEmail = req.body.recipientEmail;
        const student = await User.findOne({email: studentEmail, role: 'student'})
        if(!student) {
          return res.status(404).json({error: "student not found"})
        }

        const resource = await Resource.create({
          owner: req.user.id,
          recipient: student._id,
          filename: req.file.originalname,
          url: `/uploads/pdfs/${req.file.filename}`,
          type: 'assignment',
          visibility: 'private',
        })
        
        console.log("Saved PDF to mongodb", resource._id)

        res.json({
          message: "Pdf Uploaded successfully", 
          assignment: {
            id: resource._id,
            filename: resource.filename,
            url: `${req.protocol}://${req.get('host')}${resource.url}`,
            uploadedAt: resource.createdAt
          }})
      } catch (dbErr) {
        console.error("DB save failed", dbErr)
        res.status(500).json({error: "failed to save pdf record"})
      }
    }
  )

export default router