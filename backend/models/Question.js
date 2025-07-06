import mongoose from 'mongoose'
const {Schema, model} = mongoose

const questionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    default: ''
  }
}, {timestamps: true})


const Question = model("Question", questionSchema)
export default Question