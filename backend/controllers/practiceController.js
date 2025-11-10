import PracticeLog from "../models/PracticeLog.js";
import User from '../models/User.js'

function toDateTime(dateStr, timeStr) {
  const [y,m,d] = dateStr.split('-').map(Number)
  const [hour, min] = timeStr.split(':').map(Number)
  return new Date(Date.UTC(y,m-1, d, hour, min, 0))
}


export async function createPractice(req,res,next) {
  try {
    const me = await User.findById(req.user.id).select('assignedTeacher role');
    if(!me || me.role !== 'student') return res.status(400).json({message: 'Link a teacher before submitting.'});
    
    const {date, startTime, endTime, focus, struggles, wins, notes, metronome, bpm} = req.body;

    if(!date || !startTime || !endTime) {
      return res.status(400).json({message: 'date, startTime, and endTime are required'})
    } 

    const start = toDateTime(date, startTime)
    const end = toDateTime(date, endTime)
    if(!(end > start)) return res.status(400).json({message: 'endTime must be after start time'})

    const durationMin = Math.round((end-start) / 60000)

    const doc =  await PracticeLog.create({
      student: req.user.id,
      teacher: me.assignedTeacher,
      date: new Date(date + 'T00:00:00Z'),
      start, end, durationMin,
      focus, struggles, wins, notes,
      metronome: !!metronome,
      bpm: bpm ? Number(bpm) : null,
      unreadForTeacher: true,
      unreadForStudent: false,
      status: 'submitted'
    })

    res.status(201).json({message: 'Saved', log: doc})
  } catch (e) {next(e)}
}


export async function getMyPractice(req,res,next) {
  try {
    const list = await PracticeLog.find({student: req.user.id})
      .sort('-date -start')
      .limit(50);
    res.json({logs:list})
  } catch (e) {next(e)}
}

export async function getStudentPracticeForTeacher(req,res,next) {
  try {
    const {studentId} = req.params;

    const list = await PracticeLog.find({student: studentId, teacher: req.user.id})
      .sort('-date -start')
      .limit(100)

      await PracticeLog.updateMany(
        {student: studentId, teacher: req.user.id, unreadForTeacher: true},
        {$set: {unreadForTeacher: false}}
      )
    res.json({logs: list})
  } catch (e) {next(e)}
}