import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);



const UPLOADS_ROOT = path.join(__dirname, '../uploads')
const PDF_DIR = path.join(UPLOADS_ROOT, 'pdfs')
const VIDEO_DIR = path.join(UPLOADS_ROOT, 'videos')

fs.mkdirSync(UPLOADS_ROOT, {recursive: true})
fs.mkdirSync(PDF_DIR, {recursive: true})
fs.mkdirSync(VIDEO_DIR, {recursive: true})

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => 
    cb(null, VIDEO_DIR),
  filename: (_req,file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

// PDF stuff

const pdfStorage = multer.diskStorage({
  destination: (_req,_file, cb) => cb(null, PDF_DIR),
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const pdfFilter = (_req,file, cb) => {
  if (file.mimetype === 'application/pdf') cb (null, true)
  else cb(new Error("Only PDF files please"), false)
}

const videoFilter = (_req, file, cb) => {
  if(file.mimetype.startsWith('video/')) cb(null, true)
  else cb(new Error('Only video files allowed'), false)
}



export const uploadVideo = multer({storage: videoStorage, fileFilter: videoFilter})
export const uploadPdf = multer({storage: pdfStorage, fileFilter: pdfFilter})

