// backend/middleware/upload.js
import multer from 'multer';
import path   from 'path';
import fs     from 'fs';
import { fileURLToPath } from 'url';

const __filename    = fileURLToPath(import.meta.url);
const __dirname     = path.dirname(__filename);

// one single uploads root on both dev & prod
const UPLOADS_ROOT = path.join(__dirname, '../uploads');

// ensure that folder exists every start
if (!fs.existsSync(UPLOADS_ROOT)) {
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
  console.log(`✅ Created uploads root: ${UPLOADS_ROOT}`);
}

// storage engine: flat in UPLOADS_ROOT
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_ROOT)
  },
  filename:    (_req, file, cb) => {
    // prefix with type so we still know what it is
    const prefix = file.mimetype.startsWith('video/') ? 'video' : 'pdf';
    const name   = `${Date.now()}-${prefix}-${file.originalname}`;
    console.log('🛑 MULTER saving file to:', UPLOADS_ROOT, name);
    cb(null, name);
  }
});

// allow both videos and PDFs
const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only video or PDF files allowed'), false);
  }
};

export const uploadMiddleware = multer({ storage, fileFilter });
