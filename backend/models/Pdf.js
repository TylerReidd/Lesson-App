import mongoose from 'mongoose'
const {Schema} = mongoose

const pdfSchema = new Schema({
  filename: { Type: String, required: true},
  originalName: {Type: String, required: true},
  uploader: {type: mongoose.Types.ObjectId, ref: 'User', required: true},
  uploadedAt: {type: Date, default: Date.now},
})

const Pdf = mongoose.models.Pdf
? mongoose.model("Resource")
: mongoose.model('Resource', pdfSchema)
export default Pdf