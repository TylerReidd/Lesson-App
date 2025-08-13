// backend/middleware/auth.js
import jwt from "jsonwebtoken";

// Accept cookie *or* Authorization: Bearer <token>
export function isAuthenticated(req, res, next) {
  // Allow CORS preflight to pass unauthed
  if (req.method === 'OPTIONS') return res.sendStatus(204);

  let token = req.cookies?.token;
  const auth = req.headers.authorization;
  if(!token && auth?.startsWith('Bearer ')) {
    token = auth.split(' ')[1]
  } else {
    token = req.cookies?.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: no token' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET not set!");
    return res.status(500).json({ message: "Server Misconfiguration" });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// unchanged
export function isStudent(req, res, next) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ message: 'Forbidden: students only' });
  }
  next();
}

export function isTeacher(req, res, next) {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden: teachers only' });
  }
  next();
}

export function isTeacherOrStudent(req, res, next) {
  const role = req.user?.role;
  if (role === "teacher" || role === "student") return next();
  return res.status(403).json({ error: "Not authorized" });
}




export default { isAuthenticated, isStudent, isTeacher };
