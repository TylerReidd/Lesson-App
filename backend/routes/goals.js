import express from "express";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import { isAuthenticated, isStudent, isTeacher } from "../middleware/auth.js";

const router = express.Router();

function normalizeGoalPayload(payload) {
  const title = String(payload?.title || "").trim();
  const description = String(payload?.description || "").trim();
  const category = String(payload?.category || "custom").trim() || "custom";
  const status = ["active", "paused", "completed"].includes(payload?.status)
    ? payload.status
    : "active";
  const priority = ["low", "medium", "high"].includes(payload?.priority)
    ? payload.priority
    : "medium";
  const teacherNotes = String(payload?.teacherNotes || "").trim();
  const targetDateRaw = String(payload?.targetDate || "").trim();

  if (!title) {
    return { error: "Goal title is required." };
  }

  let targetDate = null;
  if (targetDateRaw) {
    const parsed = new Date(targetDateRaw);
    if (Number.isNaN(parsed.getTime())) {
      return { error: "Target date is invalid." };
    }
    targetDate = parsed;
  }

  return {
    title,
    description,
    category,
    status,
    priority,
    teacherNotes,
    targetDate,
  };
}

router.get("/student", isAuthenticated, isStudent, async (req, res, next) => {
  try {
    const goals = await Goal.find({ student: req.user.id }).sort({
      status: 1,
      targetDate: 1,
      updatedAt: -1,
    });
    res.json({ goals });
  } catch (e) {
    next(e);
  }
});

router.get("/teacher/:studentId", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const student = await User.findById(req.params.studentId).select(
      "_id role assignedTeacher"
    );
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found." });
    }
    if (String(student.assignedTeacher) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not your student." });
    }

    const goals = await Goal.find({
      teacher: req.user.id,
      student: req.params.studentId,
    }).sort({ status: 1, targetDate: 1, updatedAt: -1 });

    res.json({ goals });
  } catch (e) {
    next(e);
  }
});

router.post("/teacher/:studentId", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const student = await User.findById(req.params.studentId).select(
      "_id role assignedTeacher"
    );
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found." });
    }
    if (String(student.assignedTeacher) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not your student." });
    }

    const parsed = normalizeGoalPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const goal = await Goal.create({
      teacher: req.user.id,
      student: req.params.studentId,
      ...parsed,
    });

    res.status(201).json({ goal });
  } catch (e) {
    next(e);
  }
});

router.put(
  "/teacher/:studentId/:goalId",
  isAuthenticated,
  isTeacher,
  async (req, res, next) => {
    try {
      const parsed = normalizeGoalPayload(req.body);
      if (parsed.error) {
        return res.status(400).json({ message: parsed.error });
      }

      const goal = await Goal.findOneAndUpdate(
        {
          _id: req.params.goalId,
          teacher: req.user.id,
          student: req.params.studentId,
        },
        parsed,
        { new: true, runValidators: true }
      );

      if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
      }

      res.json({ goal });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/teacher/:studentId/:goalId",
  isAuthenticated,
  isTeacher,
  async (req, res, next) => {
    try {
      const goal = await Goal.findOneAndDelete({
        _id: req.params.goalId,
        teacher: req.user.id,
        student: req.params.studentId,
      });

      if (!goal) {
        return res.status(404).json({ message: "Goal not found." });
      }

      res.json({ message: "Goal deleted." });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
