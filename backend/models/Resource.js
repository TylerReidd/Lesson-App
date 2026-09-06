import mongoose from 'mongoose'
const {Schema} = mongoose

const resourceSchema = new Schema({
  owner: {                           // who this resource belongs to
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {                        // original filename
    type: String,
    required: true
  },
  url: {                             // public URL to download/stream
    type: String,
    required: true
  },
  type: {                            // differentiate assignment vs video
    type: String,
    enum: ['assignment','video'],
    required: true
  },
  visibility: {                      // public vs private
    type: String,
    enum: ['public','private'],
    default: 'private'
  },
  unreadForTeacher: {             // for private videos, has teacher viewed it
    type: Boolean,
    default: false
  },
  unreadForStudent: {             // for private videos, has student viewed it
    type: Boolean,
    default: false
  },
  recipient: {                       // for private videos, who gets it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  }
}, { timestamps: true });

const Resource = mongoose.models.Resource
? mongoose.model("Resource")
: mongoose.model('Resource', resourceSchema)

export default Resource
