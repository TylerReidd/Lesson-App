import Question from '../models/Question.js'

export async function postQuestion(req, res, next) {
  try {
    const {text} = req.body;
    if(!text) {
      return res.status(400).json({message: "Gotta say something first!"});
    }
    const question = new Question({
      student: req.user._id,
      text
    })
    res.status(201).json({
       id: question._id, 
       text: question.text, 
       createdAt: question.createdAt,
       message: 'Thanks! Get back to you ASAP!',
      })
  } catch (err) {
    next(err)
  }
}

export async function getMyQuestions(req,res,next) { 
  try {
    const questions = await Question.find({student: req.user._id})
    .sort('-createdAt')
    res.json(questions.map(q => ({
      id: q._id,
      text: q.text,
      createdAt: q.createdAt
    })))
  } catch(err) {
    next(err)
  }
}

export async function getAllQuestions (req,res, next)  {
  try {
    const questions = await Question.find().populate('student', 'name email').sort('-createdAt')
    res.json(questions.map(q =>({
      id: q._id,
      student: q.student,
      text: q.text,
      answer: q.answer || null,
      createdAt: q.createdAt,
      answeredAt: q.answeredAt || null
    })))
  } catch (err) {
    next(err)
  }
}


// respond to question
export async function respondToQuestion (req,res,next) {
  try {
    const {id} = req.params
    const { answer} = req.body;
    if(!answer) return res.status(400).json({message: 'Answer text is required'})

    const question = await Question.findByIdAndUpdate(
      id, 
      {answer, answeredAt: new Date()},
      {new:true}
    )
    if(!question) return res.status(404).json({message:"Question not found"})

    res.json({
      id: question._id,
      text: question.text,
      answer: question.answer,
      answeredAt: question.answeredAt
    })
  } catch(err) {
    next(err)
  }
}