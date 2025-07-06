// controllers/resourceController.js
import Resource from '../models/Resource.js';

// 📥 Get assignments for a student
export async function getAssignments(req, res, next) {
  try {
    const list = await Resource.find({
      type:       'assignment',
      visibility: 'private',
      recipient:  req.user.userId
    }).sort('-createdAt');

    const host = `${req.protocol}://${req.get('host')}`;
    const out  = list.map(r => ({
      id:           r._id,
      originalName: r.filename,
      url:          `${host}${r.url}`,
      uploadedAt:   r.createdAt
    }));
    res.json(out);
  } catch (err) { next(err) }
}

// 📤 Upload a PDF assignment
export async function uploadAssignment(req, res, next) {
  try {
    const file      = req.file;
    const { recipient } = req.body;
    if (!file)      return res.status(400).json({ message: "No PDF provided" });
    if (!recipient) return res.status(400).json({ message: "No recipient" });

    const { originalname, filename } = file;
    const url = `/uploads/pdfs/${filename}`;

    const assignment = await Resource.create({
      owner:      req.user.userId,
      recipient,
      filename:   originalname,
      url,
      type:       'assignment',
      visibility: 'private'
    });

    return res.status(201).json({
      id:           assignment._id,
      originalName: assignment.filename,
      url:          `${req.protocol}://${req.get('host')}${assignment.url}`,
      uploadedAt:   assignment.createdAt,
      message:      "Assignment uploaded!"
    });
  } catch (err) { next(err) }
}

// 🎥 Get private videos
export async function getPrivateVideos(req, res, next) {
  try {
    const list = await Resource.find({
      recipient:  req.user.userId,
      type:       'video',
      visibility: 'private'
    }).sort('-createdAt');

    const host = `${req.protocol}://${req.get('host')}`;
    const out  = list.map(r => ({
      id:           r._id,
      originalName: r.filename,
      url:          `${host}${r.url}`,
      uploadedAt:   r.createdAt
    }));
    res.json({ videos: out });
  } catch (err) { next(err) }
}

// 🎥 Upload a private video
export async function uploadVideo(req, res, next) {
  try {
    const file      = req.file;
    const { recipient } = req.body;
    if (!file)      return res.status(400).json({ message: "No video provided" });
    if (!recipient) return res.status(400).json({ message: "No recipient" });

    const { originalname, filename } = file;
    const url = `/uploads/videos/${filename}`;

    const video = await Resource.create({
      owner:      req.user.userId,
      recipient,
      filename:   originalname,
      url,
      type:       'video',
      visibility: 'private'
    });
    res.status(201).json({ message: 'Video uploaded', video });
  } catch (err) { next(err) }
}

// 🎥 Get public videos
export async function getPublicVideos(_req, res, next) {
  try {
    const list = await Resource.find({ type: 'video', visibility: 'public' }).sort('-createdAt');
    const host = `${_req.protocol}://${_req.get('host')}`;
    const out  = list.map(r => ({
      id:           r._id,
      originalName: r.filename,
      url:          `${host}${r.url}`,
      uploadedAt:   r.createdAt
    }));
    res.json({ videos: out });
  } catch (err) { next(err) }
}
