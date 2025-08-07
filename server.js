import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './backend/routes/auth.js';
import resourceRoutes from './backend/routes/resources.js';
import questionRoutes from './backend/routes/questions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

// --- Uploads Migration & Static Setup ---
const UP = path.join(__dirname, 'backend', 'uploads');
const OLD_VIDEOS = path.join(UP, 'videos');

// 1) Log the flat uploads folder
console.log('🛑 SERVING /uploads from:', UP);
console.log('🛑 uploads folder exists?', fs.existsSync(UP));
console.log('🛑 uploads contents:', fs.existsSync(UP) ? fs.readdirSync(UP) : []);

// 2) Migrate old videos if the subfolder exists
if (fs.existsSync(OLD_VIDEOS)) {
  console.log('🛑 migrating old videos from:', OLD_VIDEOS);
  for (const file of fs.readdirSync(OLD_VIDEOS)) {
    fs.renameSync(path.join(OLD_VIDEOS, file), path.join(UP, file));
  }
  fs.rmdirSync(OLD_VIDEOS);
  console.log('🛑 post-migration uploads contents:', fs.readdirSync(UP));
}

// --- Express App Setup ---
const app = express();

// Connect to MongoDB
const PORT = process.env.PORT || 5001;
const uri = process.env.MONGO_URI;
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS
const allowedOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_ORIGIN
  : 'http://localhost:5173';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length,Accept-Ranges,Content-Range');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Static uploads
app.use(
  '/uploads',
  express.static(UP, {
    etag: false,
    lastModified: false,
    maxAge: 0,
    setHeaders(res) {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'no-cache');
    },
  })
);

// API Routes
app.use('/api/questions', questionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/auth', authRoutes);

// Serve React Client
const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Ensure MONGO_URI is set
if (!uri) {
  console.error('❌ MONGO_URI not set in environment');
  process.exit(1);
}
