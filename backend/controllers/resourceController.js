const Resource = require('../models/Resource');

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
