// backend/middleware/upload.js
import multer from 'multer';
import path   from 'path';
import fs     from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Decide on disk vs. dev folder
const UPLOADS_ROOT = path.join(__dirname, '../uploads');
const PDF_DIR   = path.join(UPLOADS_ROOT, 'pdfs');
const VIDEO_DIR = path.join(UPLOADS_ROOT, 'videos');


  [PDF_DIR, VIDEO_DIR].forEach(dir => {
    if(!fs.existsSync(dir)){
    try {
        fs.mkdirSync(dir, {recursive: true})
        console.log(`Created upload dir: ${dir}`)
      } catch (err) {
        console.warn(`Could not create ${dir}`, err.message)
      }
    }
  });


// Storage configs
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEO_DIR),
  filename:    (_req, file, cb) => {
    const name = `${Date.now()}-${file.originalname}`
    console.log('🛑 MULTER saving file to:', VIDEO_DIR, name);
    cb(null, name)}
  
});
const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PDF_DIR),
  filename:    (_req, file, cb) => {
    const name = `${Date.now()}-${file.originalname}`;
    console.log('🛑 MULTER saving file to:', PDF_DIR, name);
    cb(null,name )}
});

// Filters
const videoFilter = (_req, file, cb) =>
  file.mimetype.startsWith('video/')
    ? cb(null, true)
    : cb(new Error('Only video files allowed'), false);
const pdfFilter = (_req,file, cb) =>
  file.mimetype === 'application/pdf'
    ? cb(null, true)
    : cb(new Error('Only PDF files please'), false);

export const uploadVideo = multer({ storage: videoStorage, fileFilter: videoFilter });
export const uploadPdf   = multer({ storage: pdfStorage,  fileFilter: pdfFilter  });
