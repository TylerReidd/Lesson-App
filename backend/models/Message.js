import mongoose from 'mongoose'
const {Schema} = mongoose;


const messageSchema = new Schema({
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {type: String, enum: ['student', 'teacher'], required: true},
  text: {type: String, default: ''},
  unreadForTeacher: {
    type: Boolean,
    default: true
  },
  unreadForStudent: {
    type: Boolean,
    default: false
  },
  attachments: {
    type: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        mimetype: { type: String },
        size: { type: Number }
      }
    ],
    default: []
  }
}, { timestamps: true });

messageSchema.index({ thread: 1, createdAt: 1 });

export default mongoose.models.Message ? mongoose.model("Message") : mongoose.model('Message', messageSchema);
