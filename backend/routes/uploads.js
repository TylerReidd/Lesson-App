import express from 'express'
import { uploadVideo } from '../middleware/upload.js';
import User from '../models/User.js';
import Video from '../models/Video.js';


const router  = express.Router();

router.post("/", (req, res) => {
  uploadVideo.single("file")(req, res, async err => {
    if (err) {
      console.error("⚠️ Multer threw:", err);
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      console.error("⚠️ No file received by Multer");
      return res.status(400).json({ error: "No file received" });
    }

    try {

      const studentEmail = req.body.recipientEmail
      const student = await User.findOne({ email: studentEmail, role: 'student'})
      if (!student) {
        return res.status(404).json({error: "Student not found"})
      }

      const vid = await Video.create({
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype,
        recipient: student._id
      })
      console.log('Saved to MongoDB', vid._id)

      res.json({message: "Upload + dv save successful", video: vid})
    } catch(dbErr) {
      console.error("DB save failed", dbErr)
      res.status(500).json({error: "Failed to save Video record"})
    }
  })
});

export default router