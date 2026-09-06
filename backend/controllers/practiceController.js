import PracticeLog from "../models/PracticeLog.js";
import Goal from "../models/Goal.js";
import User from '../models/User.js'
import { fileUrl } from "../utils/urls.js";

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
    const goalId = String(req.body?.goalId || '').trim();

    if(!date || !startTime || !endTime) {
      return res.status(400).json({message: 'date, startTime, and endTime are required'})
    } 

    const start = toDateTime(date, startTime)
    const end = toDateTime(date, endTime)
    if(!(end > start)) return res.status(400).json({message: 'endTime must be after start time'})

    const durationMin = Math.round((end-start) / 60000)

    let goal = null;
    if (goalId) {
      goal = await Goal.findOne({
        _id: goalId,
        teacher: me.assignedTeacher,
        student: req.user.id,
      }).select('_id title status category');
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found.' });
      }
    }

    const doc =  await PracticeLog.create({
      student: req.user.id,
      teacher: me.assignedTeacher,
      goal: goal?._id || null,
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
      .populate('goal', '_id title status category')
      .sort('-date -start')
      .limit(50);
    res.json({logs:list})
  } catch (e) {next(e)}
}

export async function getStudentPracticeForTeacher(req,res,next) {
  try {
    const {studentId} = req.params;

    const list = await PracticeLog.find({student: studentId, teacher: req.user.id})
      .populate('goal', '_id title status category')
      .sort('-date -start')
      .limit(100)

      await PracticeLog.updateMany(
        {student: studentId, teacher: req.user.id, unreadForTeacher: true},
        {$set: {unreadForTeacher: false}}
      )
    res.json({logs: list})
  } catch (e) {next(e)}
}

export async function createPracticeClip(req, res, next) {
  try {
    const me = await User.findById(req.user.id).select('assignedTeacher role');
    if(!me || me.role !== 'student' || !me.assignedTeacher) {
      return res.status(400).json({message: 'Link a teacher before submitting.'});
    }

    const file = req.file;
    if (!file || !file.mimetype?.startsWith('audio/')) {
      return res.status(400).json({ message: 'An audio clip is required.' });
    }

    const clipTitle = String(req.body?.clipTitle || '').trim();
    const focus = String(req.body?.focus || '').trim();
    const notes = String(req.body?.notes || '').trim();
    const goalId = String(req.body?.goalId || '').trim();
    const savedToLibrary = String(req.body?.savedToLibrary || 'true') !== 'false';
    const clipDurationSecRaw = Number(req.body?.clipDurationSec);
    const clipDurationSec = Number.isFinite(clipDurationSecRaw)
      ? Math.max(1, Math.min(60, Math.round(clipDurationSecRaw)))
      : null;

    const end = new Date();
    const start = clipDurationSec
      ? new Date(end.getTime() - clipDurationSec * 1000)
      : new Date(end.getTime() - 60 * 1000);

    let goal = null;
    if (goalId) {
      goal = await Goal.findOne({
        _id: goalId,
        teacher: me.assignedTeacher,
        student: req.user.id,
      }).select('_id title status category');
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found.' });
      }
    }

    const doc = await PracticeLog.create({
      student: req.user.id,
      teacher: me.assignedTeacher,
      goal: goal?._id || null,
      date: new Date(end.toISOString().slice(0, 10) + 'T00:00:00Z'),
      start,
      end,
      durationMin: Math.max(1, Math.ceil(((clipDurationSec || 60) / 60))),
      focus,
      notes,
      clipTitle,
      clipUrl: fileUrl(file.filename),
      clipFilename: file.originalname,
      clipMimeType: file.mimetype,
      clipDurationSec,
      savedToLibrary,
      unreadForTeacher: true,
      unreadForStudent: false,
      status: 'submitted'
    });

    res.status(201).json({ message: 'Practice clip submitted.', log: doc });
  } catch (e) { next(e); }
}

export async function updatePracticeClipLibrary(req, res, next) {
  try {
    const savedToLibrary = Boolean(req.body?.savedToLibrary);
    const log = await PracticeLog.findOneAndUpdate(
      {
        _id: req.params.id,
        student: req.user.id,
        clipUrl: { $ne: '' }
      },
      { savedToLibrary },
      { new: true }
    );

    if (!log) {
      return res.status(404).json({ message: 'Practice clip not found.' });
    }

    res.json({ log });
  } catch (e) { next(e); }
}
