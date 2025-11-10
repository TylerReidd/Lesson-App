import mongoose from 'mongoose'
const {Schema, model} = mongoose

const questionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  text: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    default: ''
  },
  unreadForTeacher: {
    type: Boolean,
    default: true
  },
  unreadforStudent: {
    type: Boolean,
    default: false
  },
  answeredAt: {type: Date}
}, {timestamps: true})



export default model("Question", questionSchema)