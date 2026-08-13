import mongoose from "mongoose";

const { Schema } = mongoose;

const lessonSchema = new Schema(
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
      trim: true,
      maxlength: 120,
      default: "Lesson",
    },
    start: {
      type: Date,
      required: true,
      index: true,
    },
    end: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

lessonSchema.index({ teacher: 1, start: 1 });
lessonSchema.index({ student: 1, start: 1 });

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);

export default Lesson;
