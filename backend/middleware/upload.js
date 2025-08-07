// backend/middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine uploads root: use persistent volume in production, local folder in dev
const UPLOADS_ROOT = process.env.NODE_ENV === 'production'
  ? (process.env.PERSISTENT_UPLOADS_PATH || path.join(__dirname, '../uploads'))
  : path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_ROOT)) {
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
  console.log(`✅ Created uploads root: ${UPLOADS_ROOT}`);
}

// Multer storage engine: flat in UPLOADS_ROOT
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_ROOT);
  },
  filename: (_req, file, cb) => {
    const prefix = file.mimetype.startsWith('video/') ? 'video' : 'pdf';
    const name = `${Date.now()}-${prefix}-${file.originalname}`;
    console.log('🛑 MULTER saving file to:', UPLOADS_ROOT, name);
    cb(null, name);
  }
});

// Accept only videos and PDFs
const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only video or PDF files allowed'), false);
  }
};

export const uploadMiddleware = multer({ storage, fileFilter });
