import mongoose from 'mongoose'
const {Schema} = mongoose

const pdfSchema = new Schema({
  filename: { type: String, required: true},
  originalName: {type: String, required: true},
  uploader: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  uploadedAt: {type: Date, default: Date.now},
})

const Pdf = mongoose.models.Pdf
? mongoose.model("Pdf")
: mongoose.model('Pdf', pdfSchema)

export default Pdf