import Resource from "../models/Resource.js";
import Question from "../models/Question.js";
import PracticeLog from "../models/PracticeLog.js";

function buildSummary({ videos = 0, assignments = 0, questions = 0, practice = 0 } = {}) {
  const total = videos + assignments + questions + practice;
  return { videos, assignments, questions, practice, total };
}

export async function getNotificationSummary(req, res, next) {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    let summary = buildSummary();

    if (role === "teacher") {
      const [videos, questions, practice] = await Promise.all([
        Resource.countDocuments({
          type: "video",
          recipient: userId,
          unreadForTeacher: true,
        }),
        Question.countDocuments({
          teacher: userId,
          unreadForTeacher: true,
        }),
        PracticeLog.countDocuments({
          teacher: userId,
          unreadforTeacher: true,
        }),
      ]);

      summary = buildSummary({ videos, questions, practice });
    } else if (role === "student") {
      const [videos, assignments, questions, practice] = await Promise.all([
        Resource.countDocuments({
          type: "video",
          recipient: userId,
          unreadForStudent: true,
        }),
        Resource.countDocuments({
          type: "assignment",
          recipient: userId,
          unreadForStudent: true,
        }),
        Question.countDocuments({
          student: userId,
          unreadforStudent: true,
        }),
        PracticeLog.countDocuments({
          student: userId,
          unreadForStudent: true,
        }),
      ]);

      summary = buildSummary({ videos, assignments, questions, practice });
    }

    res.json({ role, summary });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationsRead(req, res, next) {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const allowed = ["videos", "assignments", "questions", "practice"];
    const requested = Array.isArray(req.body?.types) && req.body.types.length
      ? req.body.types
      : allowed;

    const types = [...new Set(requested.filter((t) => allowed.includes(t)))];
    const updates = [];

    if (role === "teacher") {
      if (types.includes("videos")) {
        updates.push(
          Resource.updateMany(
            { type: "video", recipient: userId, unreadForTeacher: true },
            { $set: { unreadForTeacher: false } }
          )
        );
      }
      if (types.includes("questions")) {
        updates.push(
          Question.updateMany(
            { teacher: userId, unreadForTeacher: true },
            { $set: { unreadForTeacher: false } }
          )
        );
      }
      if (types.includes("practice")) {
        updates.push(
          PracticeLog.updateMany(
            { teacher: userId, unreadforTeacher: true },
            { $set: { unreadforTeacher: false } }
          )
        );
      }
      // teachers do not receive assignment alerts
    } else if (role === "student") {
      if (types.includes("videos")) {
        updates.push(
          Resource.updateMany(
            { type: "video", recipient: userId, unreadForStudent: true },
            { $set: { unreadForStudent: false } }
          )
        );
      }
      if (types.includes("assignments")) {
        updates.push(
          Resource.updateMany(
            { type: "assignment", recipient: userId, unreadForStudent: true },
            { $set: { unreadForStudent: false } }
          )
        );
      }
      if (types.includes("questions")) {
        updates.push(
          Question.updateMany(
            { student: userId, unreadforStudent: true },
            { $set: { unreadforStudent: false } }
          )
        );
      }
      if (types.includes("practice")) {
        updates.push(
          PracticeLog.updateMany(
            { student: userId, unreadForStudent: true },
            { $set: { unreadForStudent: false } }
          )
        );
      }
    }

    await Promise.all(updates);
    res.json({ cleared: types });
  } catch (err) {
    next(err);
  }
}
