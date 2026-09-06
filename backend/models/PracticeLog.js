import mongoose from "mongoose";


const PracticeLogSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },
  date: {
    type: Date, 
    requred: true
  },
  start: {
    type: Date,
    default: null
  },
  end: {
    type: Date, 
    default: null
  },
  durationMin: {
    type: Number,
    required: true
  },
  focus: {
    type: String, 
    default: ''
  },
  struggles: {
    type: String,
    default: ''
  },
  wins: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  clipTitle: {
    type: String,
    default: '',
    trim: true
  },
  clipUrl: {
    type: String,
    default: ''
  },
  clipFilename: {
    type: String,
    default: '',
    trim: true
  },
  clipMimeType: {
    type: String,
    default: '',
    trim: true
  },
  clipDurationSec: {
    type: Number,
    default: null
  },
  savedToLibrary: {
    type: Boolean,
    default: true
  },
  metronome: {
    type: Boolean,
    default: false
  },
  bpm: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'needs attention'], default : 'submitted'
  },
  teacherComment: {
    type: String, default: ''
  },
  unreadForStudent: {
    type: Boolean,
    default: false
  },
  unreadForTeacher: {
    type: Boolean,
    default: true
  },

}, {timestamps: true})

PracticeLogSchema.index({teacher: 1, student: 1, date: -1})
PracticeLogSchema.index({student: 1, goal: 1, date: -1})

export default mongoose.model('PracticeLog', PracticeLogSchema)
