const mongoose = require('mongoose')


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


module.exports = mongoose.model('Question', questionSchema)