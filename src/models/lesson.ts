import { model, Schema } from "mongoose";
import {
  ELessonDuration,
  ELessonStatus,
  ILesson,
  ILessonDocument,
} from "../interface";

const lessonSchemaFields: Record<keyof ILesson, any> = {
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  class: [{ type: Schema.Types.ObjectId, ref: "class" }],
  duration: {
    number: { type: Number, default: 1 },
    period: {
      type: String,
      enum: ELessonDuration,
      default: ELessonDuration.HOUR,
    },
  },
  lesson_plan: { type: String },
  objectives: { type: String },
  staff: {
    type: Schema.Types.ObjectId,
    ref: "staff",
    required: true,
  },
  status: { type: String, enum: ELessonStatus, default: ELessonStatus.PENDING },
  session: { type: String },
};

const lessonSchema = new Schema(lessonSchemaFields, {
  timestamps: true,
});

const LessonModel = model<ILessonDocument>("lesson", lessonSchema);
export default LessonModel;
