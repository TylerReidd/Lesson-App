import mongoose from 'mongoose'
const {Schema} = mongoose

const threadSchema = new Schema({
  student: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  teacher: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  question: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'},
  lastActivity: {type: Date, default: Date.now},
}, {timestamps: true});

threadSchema.index({teacher: 1, student: 1, updatedAt : -1});

export default mongoose.models.Thread ? mongoose.model("Thread") : mongoose.model('Thread', threadSchema);