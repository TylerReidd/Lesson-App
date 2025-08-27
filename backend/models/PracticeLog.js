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
  date: {
    type: Date, 
    requred: true
  },
  start: {
    type: Date,
    require: true
  },
  end: {
    type: Date, 
    required: true
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
  metronome: {
    type: Boolean,
    default: false
  },
  bpm: {
    type: Number,
    default: null
  }

}, {timestamps: true})

PracticeLogSchema.index({teacher: 1, student: 1, date: -1})

export default mongoose.model('PracticeLog', PracticeLogSchema)