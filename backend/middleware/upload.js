import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { UPLOADS_DIR } from "../config/paths.js"; // <-- NOTE the .js and the correct relative path

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`✅ Created uploads dir: ${UPLOADS_DIR}`);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const prefix = file.mimetype.startsWith("video/") ? "video" : "pdf";
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${prefix}-${safe}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("video/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only video or PDF files allowed"), false);
  }
};

export const uploadMiddleware = multer({ storage, fileFilter });
