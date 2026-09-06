import mongoose from "mongoose";

const { Schema } = mongoose;

const goalSchema = new Schema(
  {
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
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2400,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "custom",
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    targetDate: {
      type: Date,
      default: null,
    },
    teacherNotes: {
      type: String,
      trim: true,
      maxlength: 2400,
      default: "",
    },
  },
  { timestamps: true }
);

goalSchema.index({ teacher: 1, student: 1, status: 1, updatedAt: -1 });

const Goal = mongoose.models.Goal || mongoose.model("Goal", goalSchema);

export default Goal;
