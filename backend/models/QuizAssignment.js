import mongoose from "mongoose";

const { Schema } = mongoose;

const quizAssignmentSchema = new Schema(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    goal: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["assigned", "in_progress", "submitted", "graded"],
      default: "assigned",
      index: true,
    },
    dueAt: {
      type: Date,
      default: null,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

quizAssignmentSchema.index({ teacher: 1, student: 1, assignedAt: -1 });
quizAssignmentSchema.index({ quiz: 1, student: 1, status: 1 });
quizAssignmentSchema.index({ student: 1, goal: 1, assignedAt: -1 });

const QuizAssignment =
  mongoose.models.QuizAssignment ||
  mongoose.model("QuizAssignment", quizAssignmentSchema);

export default QuizAssignment;
