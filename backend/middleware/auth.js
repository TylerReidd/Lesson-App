// backend/middleware/auth.js
import jwt from "jsonwebtoken";


// 1. Verify there’s a valid JWT → attach req.user
export function isAuthenticated(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// 2. Ensure the user has the “student” role
export function isStudent(req, res, next) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ message: 'Forbidden: students only' });
  }
  next();
}

// (Optional) If you want teacher-only routes later:
export function isTeacher(req, res, next) {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden: teachers only' });
  }
  next();
}

export default { isAuthenticated, isStudent, isTeacher };
