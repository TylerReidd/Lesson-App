import mongoose from "mongoose";

const { Schema } = mongoose;

const quizAnswerSchema = new Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: Schema.Types.Mixed,
      default: null,
    },
    autoCorrect: {
      type: Boolean,
      default: null,
    },
    autoPoints: {
      type: Number,
      min: 0,
      default: 0,
    },
    manualPoints: {
      type: Number,
      min: 0,
      default: null,
    },
    teacherFeedback: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { _id: false }
);

const quizSubmissionSchema = new Schema(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "QuizAssignment",
      required: true,
      index: true,
      unique: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    answers: {
      type: [quizAnswerSchema],
      default: [],
    },
    autoScore: {
      type: Number,
      min: 0,
      default: 0,
    },
    manualScore: {
      type: Number,
      min: 0,
      default: null,
    },
    finalScore: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxScore: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["submitted", "pending_review", "graded"],
      default: "submitted",
      index: true,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: "",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

quizSubmissionSchema.index({ student: 1, submittedAt: -1 });

const QuizSubmission =
  mongoose.models.QuizSubmission ||
  mongoose.model("QuizSubmission", quizSubmissionSchema);

export default QuizSubmission;
