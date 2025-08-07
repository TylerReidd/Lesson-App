// server.js
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import fs from 'fs';

import authRoutes from './backend/routes/auth.js';
import resourceRoutes from './backend/routes/resources.js';
import questionRoutes from './backend/routes/questions.js';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directories
const UPLOADS_DIR = path.join(__dirname, 'backend', 'uploads');
const OLD_VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');

// 1) Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 2) Migrate old videos if folder exists
if (fs.existsSync(OLD_VIDEOS_DIR)) {
  console.log(`Migrating ${OLD_VIDEOS_DIR} into ${UPLOADS_DIR}`);
  for (const file of fs.readdirSync(OLD_VIDEOS_DIR)) {
    fs.renameSync(
      path.join(OLD_VIDEOS_DIR, file),
      path.join(UPLOADS_DIR, file)
    );
  }
  fs.rmdirSync(OLD_VIDEOS_DIR);
  console.log('Migration complete. Uploads now contain:', fs.readdirSync(UPLOADS_DIR));
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

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const CLIENT_ORIGIN = process.env.NODE_ENV === 'production'
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

// Serve uploads as static files
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    etag: false,
    lastModified: false,
    maxAge: 0,
    setHeaders(res) {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache');
    }
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
