import express from "express";
import Goal from "../models/Goal.js";
import Quiz from "../models/Quiz.js";
import QuizAssignment from "../models/QuizAssignment.js";
import QuizSubmission from "../models/QuizSubmission.js";
import User from "../models/User.js";
import { isAuthenticated, isStudent, isTeacher } from "../middleware/auth.js";

const router = express.Router();

//Clean up and normalize question data for storage.
function normalizeQuestion(rawQuestion, index) {
  const type = rawQuestion?.type === "short_answer" ? "short_answer" : "multiple_choice";
  const prompt = String(rawQuestion?.prompt || "").trim();
  const points = Number.isFinite(Number(rawQuestion?.points))
    ? Math.max(0, Number(rawQuestion.points))
    : 1;
  const explanation = String(rawQuestion?.explanation || "").trim();
  const id = String(rawQuestion?.id || `question-${Date.now()}-${index}`).trim();

  const question = {
    id,
    type,
    prompt,
    points,
    explanation,
    position: index,
  };

  if (type === "multiple_choice") {
    const choices = Array.isArray(rawQuestion?.choices)
      ? rawQuestion.choices
      : String(rawQuestion?.choices || "")
          .split("\n");
    question.choices = choices
      .map((choice) => String(choice || "").trim())
      .filter(Boolean);
    question.correctAnswer = String(rawQuestion?.correctAnswer || "").trim();
  } else {
    question.choices = [];
    question.correctAnswer = null;
  }

  return question;
}

//Make sure the teacher has provided all necessary input for a quiz and its questions, and return a normalized version of the data.
function validateQuizPayload(payload) {
  const title = String(payload?.title || "").trim();
  const description = String(payload?.description || "").trim();
  const status = ["draft", "published", "archived"].includes(payload?.status)
    ? payload.status
    : "draft";
  const incomingQuestions = Array.isArray(payload?.questions) ? payload.questions : [];
  const questions = incomingQuestions.map(normalizeQuestion);

  if (!title) {
    return { error: "Quiz title is required." };
  }

  for (const question of questions) {
    if (!question.prompt) {
      return { error: "Every question needs a prompt." };
    }
    if (question.type === "multiple_choice") {
      if (question.choices.length < 2) {
        return { error: "Multiple choice questions need at least two options." };
      }
      if (!question.correctAnswer) {
        return { error: "Multiple choice questions need a correct answer." };
      }
      if (!question.choices.includes(question.correctAnswer)) {
        return { error: "Correct answer must match one of the choices." };
      }
    }
  }

  return {
    title,
    description,
    status,
    questions,
  };
}

// make sure the quiz data is in a format that can be sent to the student, without exposing any sensitive information like the correct answers.
function serializeQuizForStudent(quiz) {
  return {
    _id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    status: quiz.status,
    questions: Array.isArray(quiz.questions)
      ? quiz.questions.map((question) => ({
          id: question.id,
          type: question.type,
          prompt: question.prompt,
          choices: Array.isArray(question.choices) ? question.choices : [],
          points: question.points ?? 1,
          explanation: question.explanation || "",
          position: question.position ?? 0,
        }))
      : [],
  };
}

function normalizeStudentAnswer(question, rawResponse) {
  if (question.type === "multiple_choice") {
    return String(rawResponse || "").trim();
  }
  return String(rawResponse || "").trim();
}

function serializeSubmissionForTeacher(submission, quiz) {
  const questionsById = new Map(
    Array.isArray(quiz?.questions)
      ? quiz.questions.map((question) => [question.id, question])
      : []
  );

  return {
    _id: submission._id,
    status: submission.status,
    autoScore: submission.autoScore,
    manualScore: submission.manualScore,
    finalScore: submission.finalScore,
    maxScore: submission.maxScore,
    submittedAt: submission.submittedAt,
    gradedAt: submission.gradedAt,
    feedback: submission.feedback || "",
    answers: Array.isArray(submission.answers)
      ? submission.answers.map((answer) => {
          const question = questionsById.get(answer.questionId);
          return {
            questionId: answer.questionId,
            response: answer.response,
            autoCorrect: answer.autoCorrect,
            autoPoints: answer.autoPoints,
            manualPoints: answer.manualPoints,
            teacherFeedback: answer.teacherFeedback || "",
            question: question
              ? {
                  id: question.id,
                  type: question.type,
                  prompt: question.prompt,
                  choices: Array.isArray(question.choices) ? question.choices : [],
                  correctAnswer: question.correctAnswer ?? null,
                  points: question.points ?? 1,
                  explanation: question.explanation || "",
                }
              : null,
          };
        })
      : [],
  };
}

router.get("/", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ teacher: req.user.id }).sort({
      updatedAt: -1,
      createdAt: -1,
    });
    res.json({ quizzes });
  } catch (e) {
    next(e);
  }
});

router.post("/", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const parsed = validateQuizPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const quiz = await Quiz.create({
      teacher: req.user.id,
      ...parsed,
    });

    res.status(201).json({ quiz });
  } catch (e) {
    next(e);
  }
});

router.put("/:quizId", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const parsed = validateQuizPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const quiz = await Quiz.findOneAndUpdate(
      {
        _id: req.params.quizId,
        teacher: req.user.id,
      },
      parsed,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    res.json({ quiz });
  } catch (e) {
    next(e);
  }
});

router.delete("/:quizId", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.quizId,
      teacher: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    res.json({ message: "Quiz deleted." });
  } catch (e) {
    next(e);
  }
});

router.get("/assignments", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const query = { teacher: req.user.id };
    if (req.query.studentId) {
      query.student = req.query.studentId;
    }
    if (req.query.quizId) {
      query.quiz = req.query.quizId;
    }

    const assignments = await QuizAssignment.find(query)
      .populate("student", "_id name email")
      .populate("goal", "_id title status category")
      .populate("quiz", "_id title status questions")
      .sort({ assignedAt: -1, createdAt: -1 });

    const assignmentIds = assignments.map((assignment) => assignment._id);
    const submissions = await QuizSubmission.find({
      assignment: { $in: assignmentIds },
    }).select("assignment status finalScore maxScore submittedAt gradedAt");
    const submissionByAssignment = new Map(
      submissions.map((submission) => [String(submission.assignment), submission])
    );

    res.json({
      assignments: assignments.map((assignment) => ({
        ...assignment.toObject(),
        submission: submissionByAssignment.get(String(assignment._id)) || null,
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/:quizId/assign", isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    const studentId = String(req.body?.studentId || "").trim();
    const dueAtRaw = String(req.body?.dueAt || "").trim();
    const goalId = String(req.body?.goalId || "").trim();

    if (!studentId) {
      return res.status(400).json({ message: "Student is required." });
    }

    const [quiz, student, goal] = await Promise.all([
      Quiz.findOne({ _id: req.params.quizId, teacher: req.user.id }),
      User.findById(studentId).select("_id role assignedTeacher name email"),
      goalId
        ? Goal.findOne({
            _id: goalId,
            teacher: req.user.id,
            student: studentId,
          }).select("_id title status category")
        : Promise.resolve(null),
    ]);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found." });
    }

    if (String(student.assignedTeacher) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only assign quizzes to your own students." });
    }

    if (goalId && !goal) {
      return res.status(404).json({ message: "Goal not found for this student." });
    }

    let dueAt = null;
    if (dueAtRaw) {
      const parsedDate = new Date(dueAtRaw);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Due date is invalid." });
      }
      dueAt = parsedDate;
    }

    const assignment = await QuizAssignment.create({
      quiz: quiz._id,
      teacher: req.user.id,
      student: student._id,
      goal: goal?._id || null,
      dueAt,
    });

    const hydrated = await QuizAssignment.findById(assignment._id)
      .populate("student", "_id name email")
      .populate("goal", "_id title status category")
      .populate("quiz", "_id title status questions");

    res.status(201).json({ assignment: hydrated });
  } catch (e) {
    next(e);
  }
});

router.get(
  "/assignments/:assignmentId",
  isAuthenticated,
  isTeacher,
  async (req, res, next) => {
    try {
      const assignment = await QuizAssignment.findOne({
        _id: req.params.assignmentId,
        teacher: req.user.id,
      })
        .populate("student", "_id name email")
        .populate("goal", "_id title status category")
        .populate("quiz");

      if (!assignment || !assignment.quiz) {
        return res.status(404).json({ message: "Assignment not found." });
      }

      const submission = await QuizSubmission.findOne({
        assignment: assignment._id,
      });

      res.json({
        assignment: {
          ...assignment.toObject(),
          submission: submission
            ? serializeSubmissionForTeacher(submission, assignment.quiz)
            : null,
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

router.put(
  "/submissions/:submissionId/grade",
  isAuthenticated,
  isTeacher,
  async (req, res, next) => {
    try {
      const submission = await QuizSubmission.findById(req.params.submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found." });
      }

      const assignment = await QuizAssignment.findOne({
        _id: submission.assignment,
        teacher: req.user.id,
      }).populate("quiz");

      if (!assignment || !assignment.quiz) {
        return res.status(404).json({ message: "Assignment not found." });
      }

      const manualAnswers = Array.isArray(req.body?.answers) ? req.body.answers : [];
      const feedback = String(req.body?.feedback || "").trim();
      const answerUpdates = new Map(
        manualAnswers.map((answer) => [String(answer.questionId || ""), answer])
      );
      const questionsById = new Map(
        (assignment.quiz.questions || []).map((question) => [question.id, question])
      );

      let manualScore = 0;
      const nextAnswers = (submission.answers || []).map((answer) => {
        const question = questionsById.get(answer.questionId);
        if (!question || question.type !== "short_answer") {
          return answer;
        }

        const update = answerUpdates.get(answer.questionId) || {};
        const rawManualPoints = Number(update.manualPoints);
        const boundedManualPoints = Number.isFinite(rawManualPoints)
          ? Math.max(0, Math.min(rawManualPoints, Number(question.points) || 1))
          : 0;
        manualScore += boundedManualPoints;

        return {
          ...answer.toObject(),
          manualPoints: boundedManualPoints,
          teacherFeedback: String(update.teacherFeedback || "").trim(),
        };
      });

      submission.answers = nextAnswers;
      submission.manualScore = manualScore;
      submission.finalScore = submission.autoScore + manualScore;
      submission.status = "graded";
      submission.feedback = feedback;
      submission.gradedAt = new Date();
      await submission.save();

      assignment.status = "graded";
      await assignment.save();

      res.json({
        submission: serializeSubmissionForTeacher(submission, assignment.quiz),
      });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/student/assignments", isAuthenticated, isStudent, async (req, res, next) => {
  try {
    const assignments = await QuizAssignment.find({ student: req.user.id })
      .populate("goal", "_id title status category")
      .populate("quiz", "_id title description status questions")
      .sort({ assignedAt: -1, createdAt: -1 });

    const assignmentIds = assignments.map((assignment) => assignment._id);
    const submissions = await QuizSubmission.find({ assignment: { $in: assignmentIds } }).select(
      "assignment status finalScore maxScore submittedAt gradedAt"
    );
    const submissionByAssignment = new Map(
      submissions.map((submission) => [String(submission.assignment), submission])
    );

    res.json({
      assignments: assignments.map((assignment) => {
        const submission = submissionByAssignment.get(String(assignment._id));
        return {
          _id: assignment._id,
          status: assignment.status,
          dueAt: assignment.dueAt,
          assignedAt: assignment.assignedAt,
          goal: assignment.goal
            ? {
                _id: assignment.goal._id,
                title: assignment.goal.title,
                status: assignment.goal.status,
                category: assignment.goal.category,
              }
            : null,
          quiz: assignment.quiz
            ? {
                _id: assignment.quiz._id,
                title: assignment.quiz.title,
                description: assignment.quiz.description,
                questionCount: Array.isArray(assignment.quiz.questions)
                  ? assignment.quiz.questions.length
                  : 0,
              }
            : null,
          submission: submission
            ? {
                status: submission.status,
                finalScore: submission.finalScore,
                maxScore: submission.maxScore,
                submittedAt: submission.submittedAt,
                gradedAt: submission.gradedAt,
              }
            : null,
        };
      }),
    });
  } catch (e) {
    next(e);
  }
});

router.get(
  "/student/assignments/:assignmentId",
  isAuthenticated,
  isStudent,
  async (req, res, next) => {
    try {
      const assignment = await QuizAssignment.findOne({
        _id: req.params.assignmentId,
        student: req.user.id,
      })
        .populate("goal", "_id title status category")
        .populate("quiz");

      if (!assignment || !assignment.quiz) {
        return res.status(404).json({ message: "Assigned quiz not found." });
      }

      const submission = await QuizSubmission.findOne({
        assignment: assignment._id,
        student: req.user.id,
      }).select("status finalScore maxScore submittedAt gradedAt answers feedback");

      res.json({
        assignment: {
          _id: assignment._id,
          status: assignment.status,
          dueAt: assignment.dueAt,
          assignedAt: assignment.assignedAt,
          goal: assignment.goal
            ? {
                _id: assignment.goal._id,
                title: assignment.goal.title,
                status: assignment.goal.status,
                category: assignment.goal.category,
              }
            : null,
          quiz: serializeQuizForStudent(assignment.quiz),
          submission,
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/student/assignments/:assignmentId/submit",
  isAuthenticated,
  isStudent,
  async (req, res, next) => {
    try {
      const assignment = await QuizAssignment.findOne({
        _id: req.params.assignmentId,
        student: req.user.id,
      }).populate("quiz");

      if (!assignment || !assignment.quiz) {
        return res.status(404).json({ message: "Assigned quiz not found." });
      }

      const existingSubmission = await QuizSubmission.findOne({
        assignment: assignment._id,
        student: req.user.id,
      });

      if (existingSubmission) {
        return res.status(400).json({ message: "This quiz has already been submitted." });
      }

      const rawAnswers = req.body?.answers;
      if (!rawAnswers || typeof rawAnswers !== "object") {
        return res.status(400).json({ message: "Answers are required." });
      }

      let autoScore = 0;
      let maxScore = 0;
      let hasShortAnswer = false;

      const answers = (assignment.quiz.questions || []).map((question) => {
        const normalizedResponse = normalizeStudentAnswer(
          question,
          rawAnswers[question.id]
        );
        const points = Number(question.points) || 1;
        maxScore += points;

        if (question.type === "multiple_choice") {
          const isCorrect = normalizedResponse === String(question.correctAnswer || "").trim();
          const awardedPoints = isCorrect ? points : 0;
          autoScore += awardedPoints;
          return {
            questionId: question.id,
            response: normalizedResponse,
            autoCorrect: isCorrect,
            autoPoints: awardedPoints,
            manualPoints: null,
            teacherFeedback: "",
          };
        }

        hasShortAnswer = true;
        return {
          questionId: question.id,
          response: normalizedResponse,
          autoCorrect: null,
          autoPoints: 0,
          manualPoints: null,
          teacherFeedback: "",
        };
      });

      const submission = await QuizSubmission.create({
        quiz: assignment.quiz._id,
        assignment: assignment._id,
        student: req.user.id,
        answers,
        autoScore,
        finalScore: autoScore,
        maxScore,
        status: hasShortAnswer ? "pending_review" : "graded",
      });

      assignment.status = hasShortAnswer ? "submitted" : "graded";
      await assignment.save();

      res.status(201).json({
        submission: {
          _id: submission._id,
          status: submission.status,
          autoScore: submission.autoScore,
          finalScore: submission.finalScore,
          maxScore: submission.maxScore,
          submittedAt: submission.submittedAt,
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
