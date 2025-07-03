const Question = require('./models/Question')


exports.postQuestion = async (req, res, next) => {
  try {
    const {text} = req.body;
    if(!text) {
      return res.status(400).json({message: "Gotta say something first!"});
    }
    const question = new Question({
      student: req.user._id,
      text
    })
    await question.save()
    res.status(201).json({message: 'Thanks! Get back to you ASAP!', question});
  } catch (err) {
    next(err)
  }
}

exports.getMyQuestions = async (req,res,next) => { 
  try {
    const questions = await Question.find({student: req.user._id})
    .sort('-createdAt')
    res.json({questions})
  } catch(err) {
    next(err)
  }
}

