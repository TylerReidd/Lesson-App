import Resource from '../models/Resource.js';

// 📥 Get assignments for a student
export async function getAssignments(req, res, next) {
  try {
    const query = (req.user.role === 'teacher')
    ? {type: 'assignment', owner: req.user.id}
    : {type: 'assignment' ,recipient: req.user.id};

    const list = await Resource.find(query).sort('-createdAt');
    const isProd = process.env.NODE_ENV === 'production';
    const baseURL = isProd ? process.env.CLIENT_ORIGIN : "";

    res.json(list.map(r => ({
      id: r._id,
      filename: r.filename,
      url: `${baseURL}${r.url}`,
      uploadedAt: r.createdAt
    }))) 
  } catch (err) { next(err) }
}

// 📤 Upload a PDF assignment
export async function uploadAssignment(req, res, next) {
  try {
    const file      = req.file;
    const { recipient } = req.body;
    if (!file)      return res.status(400).json({ message: "No PDF provided" });
    if (!recipient) return res.status(400).json({ message: "No recipient" });

    const url = `/uploads/pdfs/${file.filename}`;

    const assignment = await Resource.create({
      owner:      req.user.id,
      recipient,
      filename:   file.originalname,
      url,
      type:       'assignment',
      visibility: 'private'
    });

    return res.status(201).json({
      id:           assignment._id,
      filename: assignment.filename,
      url:          `${req.protocol}://${req.get('host')}${assignment.url}`,
      uploadedAt:   assignment.createdAt
    });
  } catch (err) { next(err) }
}

// 🎥 Get private videos
export async function getPrivateVideos(req, res, next) {
  try {
    const list = await Resource.find({
      recipient:  req.user.id,
      type:       'video',
      visibility: 'private'
    }).sort('-createdAt');
    
    const isProd = process.env.NODE_ENV === 'production';
    const baseURL = isProd ? process.env.CLIENT_ORIGIN : ""

    const out  = list.map(r => ({
      id:           r._id,
      filename: r.filename,
      url:          `${baseURL}${r.url}`,
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

    const url = `/uploads/videos/${file.filename}`;
    const video = await Resource.create({
      owner:      req.user.id,
      recipient,
      filename:   file.originalname,
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
      filename: r.filename,
      url:          `${host}${r.url}`,
      uploadedAt:   r.createdAt
    }));
    res.json({ videos: out });
  } catch (err) { next(err) }
}

export const deleteAssignment = async (req,res) => {
  try {
    const { id } = req.params;

    const assignment = await Resource.findById(id)
    if(!assignment) return res.status(404).json({error: "not found"})
    await Resource.findByIdAndDelete(id);
    return res.json({message: 'Deleted '})

  } catch (err) {
    return res.status(500).json({error: "server error"})
  }
}
