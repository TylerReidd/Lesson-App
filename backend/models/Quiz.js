import mongoose from "mongoose";

const { Schema } = mongoose;

const quizQuestionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["multiple_choice", "short_answer"],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    choices: [
      {
        type: String,
        trim: true,
        maxlength: 240,
      },
    ],
    correctAnswer: {
      type: Schema.Types.Mixed,
      default: null,
    },
    points: {
      type: Number,
      min: 0,
      default: 1,
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    position: {
      type: Number,
      min: 0,
      required: true,
    },
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    questions: {
      type: [quizQuestionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

quizSchema.index({ teacher: 1, updatedAt: -1 });

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

export default Quiz;
