// backend/middleware/auth.js
import jwt from "jsonwebtoken";


// 1. Verify there’s a valid JWT → attach req.user
export function isAuthenticated(req, res, next) {
  console.log("🔥 [Auth] Incoming to isAuthenticated for", req.method, req.originalUrl);
  console.log("🔥 [Auth] Raw cookie header:", req.headers.cookie);
  console.log("🔥 [Auth] Parsed req.cookies:", req.cookies);


  const token = req.cookies?.token;
  if (!token) {
    console.log("NO TOKEN FOUND -- rejecting")
    return res.status(401).json({ message: 'Unauthorized: no token' })
};

  const secret = process.env.JWT_SECRET;
  if(!secret) {
    console.error("JWT_SECRET not set!")
    return res.status(500).json({message: "Server Misconfiguration"})
  }
  try {
    const payload = jwt.verify(token, secret);
    console.log("token payload = ", payload)
    req.user = payload
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
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden: teachers only' });
  }
  next();
}


export function isTeacherOrStudent(req, res, next) {
  const role = req.user?.role;
  console.log("[AUTH] isTeacherOrStudent role=", req.user?.role);
  if (role === "teacher" || role === "student") return next();
  return res.status(403).json({ error: "Not authorized" });
}

export default { isAuthenticated, isStudent, isTeacher };
