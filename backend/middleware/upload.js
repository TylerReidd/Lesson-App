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
    let prefix = "file";
    if (file.mimetype.startsWith("video/")) prefix = "video";
    else if (file.mimetype.startsWith("image/")) prefix = "img";
    else if (file.mimetype === "application/pdf") prefix = "pdf";

    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${prefix}-${safe}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only video, PDF, or image files allowed"), false);
  }
};

const maxUploadMb = Number.parseInt(process.env.MAX_UPLOAD_MB || "250", 10);

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(1, maxUploadMb) * 1024 * 1024,
    files: 5,
    fields: 20,
  },
});
