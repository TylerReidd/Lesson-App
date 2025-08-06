// backend/middleware/upload.js
import multer from 'multer';
import path   from 'path';
import fs     from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Decide on disk vs. dev folder
const UPLOADS_ROOT = process.env.NODE_ENV === 'production'
  ? '/mnt/uploads'
  : path.join(__dirname, '../uploads');
const PDF_DIR   = path.join(UPLOADS_ROOT, 'pdfs');
const VIDEO_DIR = path.join(UPLOADS_ROOT, 'videos');

// ONLY create folders when running locally
if (process.env.NODE_ENV !== 'production') {
  [UPLOADS_ROOT, PDF_DIR, VIDEO_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Storage configs
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEO_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PDF_DIR),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
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
