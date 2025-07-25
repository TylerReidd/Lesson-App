import Question from '../models/Question.js'
import User from '../models/User.js'

export async function postQuestion(req, res, next) {
  try {
    if(req.user.role !== 'student') {
      return res.status(403).json({message: 'forbidden'})
    }

    const {text} = req.body;
    if (!text) {
      return res.status(400).json({message: 'Question is required'})
    }

    const student = await User.findById(req.user.id)
    if(!student) {
      return res.status(404).json({message: 'Student not found'})
    }

    if(!student.assignedTeacher) {
      return res.status(400).json({message: 'You must link teacher before asking question'})
    }
    const question = new Question({
      student: student._id,
      teacher: student.assignedTeacher,
      text
    })
    await question.save()

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
    const questions = await Question.find({student: req.user.id})
    .sort('-createdAt')
    res.json(questions.map(q => ({
      id: q._id,
      text: q.text,
      answer: q.answer || null,
      createdAt: q.createdAt,
      answeredAt: q.answeredAt || null
    })))
  } catch(err) {
    next(err)
  }
}

export async function getAllQuestions (req,res, next)  {
  try {
    if(req.user.role !=='teacher') return res.status(403).end();
    const questions = await Question.find({teacher: req.user.id})
      .populate('student', 'name')
      .sort('-createdAt')
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
    if(req.user.role != 'teacher') return res.status(403).end()
    if(!answer) return res.status(400).json({message: 'Answer text is required'})

    const question = await Question.findOneAndUpdate(
      {_id: id, teacher: req.user._id}, 
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