import express from "express";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
import { isAuthenticated, isStudent, isTeacher } from "../middleware/auth.js";

const router = express.Router();

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function validateTeacherStudent(studentId, teacherId) {
  if (!studentId) return null;
  const student = await User.findOne({
    _id: studentId,
    role: "student",
    assignedTeacher: teacherId,
  }).select("_id name email");
  return student;
}

router.get("/teacher/upcoming", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const now = new Date();
    const lessons = await Lesson.find({
      teacher: req.user.id,
      start: { $gte: now },
    })
      .populate("student", "_id name email")
      .sort({ start: 1 })
      .limit(24);

    res.json({ lessons });
  } catch (e) {
    next(e);
  }
});

router.get("/teacher/range", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const start = parseDate(req.query?.start);
    const end = parseDate(req.query?.end);

    if (!start || !end || !(end > start)) {
      return res.status(400).json({ message: "Valid start and end range is required." });
    }

    const lessons = await Lesson.find({
      teacher: req.user.id,
      start: { $gte: start, $lt: end },
    })
      .populate("student", "_id name email")
      .sort({ start: 1 });

    res.json({ lessons });
  } catch (e) {
    next(e);
  }
});

router.post("/teacher/lessons", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const student = await validateTeacherStudent(req.body?.studentId, req.user.id);
    if (!student) {
      return res.status(400).json({ message: "Choose one of your linked students." });
    }

    const start = parseDate(req.body?.start);
    const end = parseDate(req.body?.end);
    if (!start || !end || !(end > start)) {
      return res.status(400).json({ message: "Valid start and end times are required." });
    }

    const lesson = await Lesson.create({
      teacher: req.user.id,
      student: student._id,
      title: String(req.body?.title || "Lesson").trim() || "Lesson",
      start,
      end,
      location: String(req.body?.location || "").trim(),
      notes: String(req.body?.notes || "").trim(),
      status: req.body?.status || "scheduled",
    });

    const populated = await Lesson.findById(lesson._id).populate("student", "_id name email");
    res.status(201).json({ lesson: populated });
  } catch (e) {
    next(e);
  }
});

router.put("/teacher/lessons/:lessonId", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const existing = await Lesson.findOne({
      _id: req.params.lessonId,
      teacher: req.user.id,
    });

    if (!existing) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    const student = await validateTeacherStudent(req.body?.studentId || existing.student, req.user.id);
    if (!student) {
      return res.status(400).json({ message: "Choose one of your linked students." });
    }

    const start = parseDate(req.body?.start);
    const end = parseDate(req.body?.end);
    if (!start || !end || !(end > start)) {
      return res.status(400).json({ message: "Valid start and end times are required." });
    }

    existing.student = student._id;
    existing.title = String(req.body?.title || "Lesson").trim() || "Lesson";
    existing.start = start;
    existing.end = end;
    existing.location = String(req.body?.location || "").trim();
    existing.notes = String(req.body?.notes || "").trim();
    existing.status = req.body?.status || "scheduled";
    await existing.save();

    const populated = await Lesson.findById(existing._id).populate("student", "_id name email");
    res.json({ lesson: populated });
  } catch (e) {
    next(e);
  }
});

router.delete("/teacher/lessons/:lessonId", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const lesson = await Lesson.findOneAndDelete({
      _id: req.params.lessonId,
      teacher: req.user.id,
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    res.json({ message: "Lesson deleted." });
  } catch (e) {
    next(e);
  }
});

router.get("/student/upcoming", isAuthenticated, isStudent, async (req, res, next) => {
  try {
    const now = new Date();
    const lessons = await Lesson.find({
      student: req.user.id,
      start: { $gte: now },
    })
      .populate("teacher", "_id name email")
      .sort({ start: 1 })
      .limit(12);

    res.json({ lessons });
  } catch (e) {
    next(e);
  }
});

export default router;
