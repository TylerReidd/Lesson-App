import Resource from '../models/Resource.js';
import { fileUrl, ensureAbsolute } from '../utils/urls.js';
import { UPLOADS_DIR } from '../config/paths.js';
import fs from 'fs'
import path from 'path'

function unlinkByUrl(url) {
  try {
    if (!url) return;
    // Works for absolute and relative
    let fname = "";
    try {
      const u = new URL(url);
      fname = u.pathname.replace(/^\/+/, "");   // strip leading slash(es)
    } catch {
      // not a full URL, assume it starts with /uploads/ or just a filename
      fname = String(url).replace(/^https?:\/\/[^/]+\/+/, "").replace(/^\/+/, "");
    }
    // Ensure it’s inside uploads
    if (!fname.startsWith("uploads/")) fname = `uploads/${fname.replace(/^uploads\/+/, "")}`;
    const diskName = fname.replace(/^uploads\//, ""); // actual filename on disk
    const filePath = path.join(UPLOADS_DIR, diskName);

    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.error("[UNLINK] error:", err.message, "path:", filePath);
      }
    });
  } catch (e) {
    console.error("[UNLINK] unexpected:", e.message, "url:", url);
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
      uploadedAt: r.createdAt,
      owner:      r.owner?.toString(),
      recipient:  r.recipient?.toString()
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
      uploadedAt: assignment.createdAt,
      owner:      assignment.owner?.toString(),
      recipient:  assignment.recipient?.toString()
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
      uploadedAt: r.createdAt,
      owner:      r.owner?.toString(),
      recipient:  r.recipient?.toString()
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
        uploadedAt: video.createdAt,
        owner:      video.owner?.toString(),
        recipient:  video.recipient?.toString()
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
      uploadedAt: r.createdAt,
      owner:      r.owner?.toString(),
      recipient:  r.recipient?.toString()
    }));
    res.json({ videos: out });
  } catch (err) { next(err); }
}

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Resource.findById(id);
    if (!doc) return res.status(404).json({ error: "not found" });

    const isTeacher = req.user.role === "teacher";
    const isOwner = doc.owner?.toString() === req.user.id;
    const isRecipient = doc.recipient?.toString() === req.user.id;

    if (!isTeacher && !isOwner && !isRecipient) {
      return res.status(403).json({ error: "Not authorized to delete this file" });
    }

    unlinkByUrl(doc.url);                 // best-effort disk cleanup
    await Resource.findByIdAndDelete(id); // DB cleanup
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("[DELETE assignment] error:", err?.message);
    // Still return 200 so UI can refresh even if file was already gone
    return res.status(200).json({ message: "Deleted (file may have already been removed)" });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Resource.findById(id);
    if (!doc || doc.type !== "video") {
      return res.status(404).json({ error: "Video not found" });
    }

    const isTeacher = req.user.role === "teacher";
    const isOwner = String(doc.owner) === req.user.id;
    const isRecipient = String(doc.recipient) === req.user.id;

    console.log("[DELETE video] user=", req.user.id, req.user.role,
                "owner=", String(doc.owner), "recipient=", String(doc.recipient));

    if (!isTeacher && !isOwner && !isRecipient) {
      return res.status(403).json({ error: "Not authorized to delete this file" });
    }

    unlinkByUrl(doc.url);
    await Resource.findByIdAndDelete(id);
    return res.json({ message: "Video deleted" });
  } catch (err) {
    console.error("[DELETE video] error:", err?.message);
    return res.status(200).json({ message: "Video deleted (file may have already been removed)" });
  }
};

