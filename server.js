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
import uploadsRoutes from './backend/routes/uploads.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

console.log("🔑 NODE_ENV:", process.env.NODE_ENV);
console.log("🔑 Using MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "❌ Missing");

const allowedOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_ORIGIN
  : 'http://localhost:5173';
// ------------------- CORS -------------------
app.use((req, res, next) => {
  console.log(`[CORS] ${req.method} ${req.path} Origin: `, req.headers.origin);
  res.header('Access-Control-Allow-Origin', allowedOrigin); // Update for Render
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ------------------- Middleware -------------------
app.use(cookieParser());
app.use(express.json());

// ------------------- Routes -------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', uploadsRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/auth', authRoutes);

// ------------------- Serve React -------------------
const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// ------------------- Error Handler -------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});

// ------------------- DB + Server Start -------------------
const PORT = process.env.PORT || 5001;
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('❌ MONGO_URI not set in environment');
  process.exit(1);
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
