// server.js
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import fs from 'fs';
import mime from 'mime-types'
import { UPLOADS_DIR } from './backend/config/paths.js';
import authRoutes from './backend/routes/auth.js';
import resourceRoutes from './backend/routes/resources.js';
import questionRoutes from './backend/routes/questions.js';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory (persistent or local)
// const UPLOADS_DIR =
//   process.env.NODE_ENV === 'production'
//     ? process.env.PERSISTENT_UPLOADS_PATH || '/opt/render/uploads'
//     : path.join(__dirname, 'backend', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Migrate old videos subfolder if present
const OLD_VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
if (fs.existsSync(OLD_VIDEOS_DIR)) {
  console.log(`Migrating videos from ${OLD_VIDEOS_DIR} into ${UPLOADS_DIR}`);
  for (const file of fs.readdirSync(OLD_VIDEOS_DIR)) {
    fs.renameSync(path.join(OLD_VIDEOS_DIR, file), path.join(UPLOADS_DIR, file));
  }
  fs.rmdirSync(OLD_VIDEOS_DIR);
  console.log('Video migration complete. Uploads now contain:', fs.readdirSync(UPLOADS_DIR));
}

// Migrate old pdfs subfolder if present
const OLD_PDFS_DIR = path.join(UPLOADS_DIR, 'pdfs');
if (fs.existsSync(OLD_PDFS_DIR)) {
  console.log(`Migrating PDFs from ${OLD_PDFS_DIR} into ${UPLOADS_DIR}`);
  for (const file of fs.readdirSync(OLD_PDFS_DIR)) {
    fs.renameSync(path.join(OLD_PDFS_DIR, file), path.join(UPLOADS_DIR, file));
  }
  fs.rmdirSync(OLD_PDFS_DIR);
  console.log('PDF migration complete. Uploads now contain:', fs.readdirSync(UPLOADS_DIR));
}

// Initialize Express
const app = express();

// Connect to MongoDB
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in environment');
  process.exit(1);
}



mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });


  console.log("[BOOT] UPLOADS_DIR =", UPLOADS_DIR);
try { fs.mkdirSync(UPLOADS_DIR, { recursive:true }); fs.accessSync(UPLOADS_DIR, fs.constants.W_OK); console.log("[BOOT] uploads dir writable"); } catch(e){ console.error("[BOOT] uploads dir not writable:", e.message); }

  app.set('trust proxy', 1)

  // server.js (debug route)
  app.get('/debug/uploads', (req, res) => {
    try {
      res.json({
        UPLOADS_DIR,
        exists: fs.existsSync(UPLOADS_DIR),
        files: fs.readdirSync(UPLOADS_DIR),
        nodeEnv: process.env.NODE_ENV,
        apiHost: process.env.API_HOST
      });
    } catch (e) {
      res.status(500).json({ error: e.message, UPLOADS_DIR });
    }
  });
  

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const CLIENT_ORIGIN =
  process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_ORIGIN
    : 'http://localhost:5173';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CLIENT_ORIGIN);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length,Accept-Ranges,Content-Range');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});




app.get('/uploads/:filename', (req,res) => {
  const requested = path.normalize(req.params.filename).replace(/^(\.\.(\/|\\|$))+/, "")
  const filePath = path.join(UPLOADS_DIR, requested);

  if(!fs.existsSync(filePath)) return res.sendStatus(404);

  const type = mime.lookup(filePath) || 'application/octet-stream';
  const stat = fs.statSync(filePath)
  const range = req.headers.range;
  const isVideo = String(type).startsWith('video/');

  if(!isVideo || !range) {
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": stat.size,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=2592000, immutable"
    })
    return fs.createReadStream(filePath).pipe(res)
  }




  const [startStr, endStr] = range.replace(/bytes=/, '').split("-")
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr,10) : stat.size - 1

  if (Number.isNaN(start) || start < 0 || start >= stat.size) {
    return res.status(416).set('Content-Range', `bytes */${stat.size}`).end();
  }
  if (Number.isNaN(end) || end < start) end = Math.min(start + 1_000_000 - 1, stat.size - 1)

  const chunkSize = end - start + 1
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": type,
    "Cache-Control": "public, max-age=2592000, immutable"
  })
  fs.createReadStream(filePath, {start, end}).pipe(res)
})

// Serve uploads as static files
// Debug static file requests
app.use('/uploads', (req, res, next) => {
  console.log(`[STATIC DEBUG] ${req.method} ${req.originalUrl}`);
  next();
});
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    etag: false,
    lastModified: false,
    maxAge: 0,
    setHeaders(res) {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache');
    },
  })
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/questions', questionRoutes);

// Serve React client (assumes build output in client/dist)
const CLIENT_DIST = path.join(__dirname, 'client', 'dist');
app.use(express.static(CLIENT_DIST));
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// Global error handler — logs stack so Render shows why you got a 500
app.use((err, req, res, _next) => {
  console.error("[ERROR]", req.method, req.originalUrl, err?.stack || err);
  res.status(500).json({ error: "Server error", detail: err?.message || "unknown" });
});
