// server.js
import dotenv from 'dotenv';


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
import teacherRoutes from './backend/routes/teacher.js'
import practiceRoutes from './backend/routes/practice.js'
import notificationRoutes from './backend/routes/notifications.js';
// import studentVideos from './backend/routes/studentVideos.js';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// top of server.js
if (process.env.NODE_ENV !== 'production') {
  const { default: dotenv } = await import('dotenv');
  dotenv.config();
}

dotenv.config({path: path.resolve(__dirname, ".env")});
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

  mongoose.connection.once('open', () => {
    console.log('[db] connected to', 
    mongoose.connection.host,
    mongoose.connection.name
    )
    console.log('[db] URI ', process.env.MONGO_URI)
  })


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

  // --- DEV DEBUG: DB + users + seed helper (safe to keep; only active in non-prod) ---
if (process.env.NODE_ENV !== 'production') {
  // Shows which DB you're actually connected to, and collection counts
  app.get('/debug/db', async (_req, res) => {
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const names = collections.map(c => c.name);
      const counts = {};
      for (const col of ['users','resources','questions']) {
        try { counts[col] = await db.collection(col).countDocuments(); }
        catch { counts[col] = 'n/a'; }
      }
      res.json({
        host: mongoose.connection.host,
        name: mongoose.connection.name,   // <-- the DB name actually in use
        uri: process.env.MONGO_URI,       // <-- the exact URI the server used
        collections: names,
        counts
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Lists all users with assignedTeacher populated (helps spot dangling links)
  app.get('/debug/users', async (_req, res) => {
    try {
      const User = (await import('./backend/models/User.js')).default;
      const users = await User.find({})
        .select('_id name email role assignedTeacher')
        .populate('assignedTeacher', '_id name email role');
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Seeds a teacher+student and links them (deterministic test data)
  app.post('/debug/seed-link', async (_req, res) => {
    try {
      const User = (await import('./backend/models/User.js')).default;
      const bcrypt = (await import('bcrypt')).default;

      const tEmail = 'teacherA@example.com';
      const sEmail = 'studentS@example.com';
      const pass   = await bcrypt.hash('Passw0rd!', 10);

      let teacher = await User.findOne({ email: tEmail });
      if (!teacher) teacher = await User.create({ name: 'Teacher A', email: tEmail, password: pass, role: 'teacher' });

      let student = await User.findOne({ email: sEmail });
      if (!student) student = await User.create({ name: 'Student S', email: sEmail, password: pass, role: 'student' });

      student.assignedTeacher = teacher._id;
      await student.save();

      const studentsOfTeacher = await User.find({ role:'student', assignedTeacher: teacher._id }).select('name email');
      res.json({
        teacher: { id: teacher._id, email: teacher.email },
        student: { id: student._id, email: student.email },
        studentsOfTeacher
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

  

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
  let end = endStr ? parseInt(endStr,10) : stat.size - 1

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
app.use('/api/teacher', teacherRoutes)
app.use('/teacher', teacherRoutes)
app.use('/api/practice', practiceRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use("/api/studentVideos", studentVideos)
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
