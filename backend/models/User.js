import mongoose from 'mongoose'
const {Schema} = mongoose


const userSchema = new Schema({
  name: {
    type: String, 
    required: true},
  email: {
    type: String, required: true, unique: true},
  password: {
    type: String, 
    required: true},
  role: {
    type: String,
    enum: ['student','teacher'],
    required: true,
    default: 'student'
  },
  assignedTeacher: {type: Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true})


const User = mongoose.models.User
? mongoose.model("User")
: mongoose.model('User', userSchema)

export default User