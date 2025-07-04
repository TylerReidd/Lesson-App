const Resource = require('../models/Resource');


exports.getPrivateVideos = async (req, res, next) => {
  try {
    const videos = await Resource.find({
      recipient: req.user._id,
      type: 'video',
      visibility: 'private'
    }).sort('-createdAt');
    res.json({videos})
  } catch (err) {
    next(err)
  }
}

exports.uploadVideo = async (req,res,next) => {
  console.log("UploadVideo was Called")
  console.log('req.file = ', req.file)
  console.log('req.body =', req.body)
  try {
    const file = req.file;
    const {recipient} = req.body;
    if(!file) return res.status(400).json({message: "no file provided"})

    const url = `/uploads/${file.filename}`;
    const video = await Resource.create({
      owner: req.user._id,
      recipient,
      filename: file.originalName,
      url,
      type: 'video',
      visibility: 'private'
    })
    res.status(201).json({message: 'Video Uploaded', video});
  } catch (err) {
    next(err)
  }
}

exports.uploadAssignment = async (req,res, next) => {
  try {
    const file = req.file;
    if(!file) return res.status(400).json({message: 'No file provided '})

    const url = `/uploads/${file.filename}`

    const resource = await Resource.create({
      owner: req.body.studentId,
      filename : file.originalName,
      url,
      type: 'assignment',
      visibility: 'private'

    })

    res.status(201).json({message: 'Assignment uploaded', resource});
  } catch(err){
    next(err)
  }
}

// GET /api/resources/assignments
exports.getAssignments = async (req, res, next) => {
  try {
    // fetch only PDFs marked as assignments for this student
    const assignments = await Resource
      .find({
        owner: req.user._id,
        type: 'assignment',
        visibility: 'private'
      })
      .sort('-createdAt');
    res.json({ assignments });
  } catch (err) {
    next(err);
  }
};

exports.getPublicVideos = async (req, res, next) => {
  try {
    const videos = await Resource.find({
      type: 'video',
      visibility: 'public'
    }).sort('-createdAt')
    res.json({videos})
  } catch (err) {
    next(err)
  }
}
