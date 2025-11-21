import Question from '../models/Question.js'
import User from '../models/User.js'
import mongoose from 'mongoose'

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
      text,
      unreadForTeacher: true,
      unreadForStudent: false
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

    // const teacherId = req.user.id
    const question = await Question.findOneAndUpdate(
      {
        _id: id,
        teacher: req.user.id, 
      },
      { 
        answer, 
        answeredAt: new Date(), 
        unreadForStudent: true, 
        unreadForTeacher: false
      },
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


export const deleteQuestion = async (req,res,next) => {
  try {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: "Invalid question ID"});
    }

    const filter = { _id: id };

    if (req.user.role === 'student') {
      filter.student = req.user.id;
    } else if (req.user.role === 'teacher') {
      filter.teacher = req.user.id;
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    const deleted = await Question.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({error: "Question not found or not yours"})
    }
    res.json({message: "Deleted", id: deleted._id})
  } catch (err) {
    next(err);
  }
}
