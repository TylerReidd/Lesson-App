import mongoose from "mongoose";

const { Schema } = mongoose;

const lessonNoteSchema = new Schema(
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
      maxlength: 120,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
  },
  { timestamps: true }
);

lessonNoteSchema.index({ teacher: 1, student: 1, updatedAt: -1 });

const LessonNote = mongoose.models.LessonNote || mongoose.model("LessonNote", lessonNoteSchema);

export default LessonNote;
