// backend/config/paths.js
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use Render mount in prod if provided; otherwise fallback to backend/uploads
export const PERSISTENT_UPLOADS_PATH = process.env.PERSISTENT_UPLOADS_PATH;
export const UPLOADS_DIR =
  PERSISTENT_UPLOADS_PATH || path.join(__dirname, "..", "uploads");
