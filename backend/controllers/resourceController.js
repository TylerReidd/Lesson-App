import Resource from '../models/Resource.js';
import { fileUrl, ensureAbsolute } from '../utils/urls.js';

const UPLOADS_DIR = "/opt/render/uploads";


function unlinkByUrl(url) {
  try {
    // You’re storing absolute URLs now (https://.../uploads/<file>)
    // Parse and strip the /uploads/ prefix safely:
    const u = new URL(url);
    const fname = u.pathname.replace(/^\/uploads\//, "");
    const fpath = path.join(UPLOADS_DIR, fname);

    fs.unlink(fpath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("[UNLINK] error:", err.message);
      }
    });
  } catch (e) {
    // Fallback if URL parsing fails; allow relative “/uploads/..” too
    const fname = String(url || "").replace(/^https?:\/\/[^/]+\/uploads\//, "").replace(/^\/uploads\//, "");
    const fpath = path.join(UPLOADS_DIR, fname);
    fs.unlink(fpath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("[UNLINK] error:", err.message);
      }
    });
  }
}

// 📥 Get assignments for a student
export async function getAssignments(req, res, next) {
  try {
    const query = (req.user.role === 'teacher')
      ? { type: 'assignment', owner: req.user.id }
      : { type: 'assignment', recipient: req.user.id };

    const list = await Resource.find(query).sort('-createdAt');
    const assignments = list.map(r => ({
      id:         r._id,
      filename:   r.filename,                 // display name (originalname)
      url:        ensureAbsolute(r.url),      // make absolute if needed
      uploadedAt: r.createdAt
    }));
    res.json({ assignments });
  } catch (err) { next(err); }
}

// 📤 Upload a PDF assignment
export async function uploadAssignment(req, res, next) {
  try {
    const file = req.file;
    const { recipient } = req.body;
    if (!file)      return res.status(400).json({ message: "No PDF provided" });
    if (!recipient) return res.status(400).json({ message: "No recipient" });

    // Absolute URL based on API_HOST
    const url = fileUrl(file.filename);

    const assignment = await Resource.create({
      owner:      req.user.id,
      recipient,
      filename:   file.originalname,   // keep human-friendly display name
      url,                             // store absolute URL
      type:       'assignment',
      visibility: 'private'
    });

    return res.status(201).json({
      id:         assignment._id,
      filename:   assignment.filename,
      url:        assignment.url,      // already absolute
      uploadedAt: assignment.createdAt
    });
  } catch (err) { next(err); }
}

// 🎥 Get private videos
export async function getPrivateVideos(req, res, next) {
  try {
    const list = await Resource.find({
      recipient:  req.user.id,
      type:       'video',
      visibility: 'private'
    }).sort('-createdAt');

    const out = list.map(r => ({
      id:         r._id,
      filename:   r.filename,
      url:        ensureAbsolute(r.url),
      uploadedAt: r.createdAt
    }));

    res.json({ videos: out });
  } catch (err) { next(err); }
}

// 🎥 Upload a private video
export async function uploadVideo(req, res, next) {
  try {
    const file = req.file;
    const { recipient } = req.body;
    if (!file)      return res.status(400).json({ message: "No video provided" });
    if (!recipient) return res.status(400).json({ message: "No recipient" });

    // Absolute URL
    const url = fileUrl(file.filename);

    const video = await Resource.create({
      owner:      req.user.id,
      recipient,
      filename:   file.originalname,   // display name
      url,                             // absolute
      type:       'video',
      visibility: 'private'
    });

    res.status(201).json({
      video: {
        id:         video._id,
        filename:   video.filename,
        url:        video.url,         // absolute
        uploadedAt: video.createdAt
      }
    });
  } catch (err) { next(err); }
}

// 🎥 Get public videos
export async function getPublicVideos(_req, res, next) {
  try {
    const list = await Resource.find({ type: 'video', visibility: 'public' }).sort('-createdAt');
    const out  = list.map(r => ({
      id:         r._id,
      filename:   r.filename,
      url:        ensureAbsolute(r.url),
      uploadedAt: r.createdAt
    }));
    res.json({ videos: out });
  } catch (err) { next(err); }
}

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Resource.findById(id);

    if (!assignment) return res.status(404).json({ error: "Not found" });

    // Remove from disk
    unlinkByUrl(assignment.url);

    await Resource.findByIdAndDelete(id);
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Resource.findById(id);

    if (!video || video.type !== "video") {
      return res.status(404).json({ error: "Video not found" });
    }

    // Remove from disk
    unlinkByUrl(video.url);

    await Resource.findByIdAndDelete(id);
    return res.json({ message: "Video deleted" });
  } catch (err) {
    next(err);
  }
};

