import mongoose, { Schema } from "mongoose";
import { ILearningPath } from "../interfaces/IlearningPath.interface";

const learningPathCourseSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const learningPathSchema = new Schema<ILearningPath>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    targetDate: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    courses: {
      type: [learningPathCourseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

learningPathSchema.index({ user: 1, title: 1 }, { unique: true });

const LearningPathModel = mongoose.model<ILearningPath>(
  "LearningPath",
  learningPathSchema
);

export default LearningPathModel;

