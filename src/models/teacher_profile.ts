import { model, Schema } from "mongoose";

const teacherAssignmentSchema = new Schema(
  {
    class: {
      type: Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    subjects: [{ type: Schema.Types.ObjectId, ref: "subject", required: true }],
  },
  { _id: false },
);

const teacherProfileSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: "account",
      required: true,
      unique: true,
    },
    staff: {
      type: Schema.Types.ObjectId,
      ref: "staff",
      required: true,
    },
    assignments: {
      type: [teacherAssignmentSchema],
      default: [],
    },
    // Retained temporarily so teacher accounts created before assignments were
    // introduced can still be read and edited.
    classes: [{ type: Schema.Types.ObjectId, ref: "class" }],
    subjects: [{ type: Schema.Types.ObjectId, ref: "subject" }],
    created_by: { type: Schema.Types.ObjectId, ref: "account" },
  },
  { timestamps: true },
);

teacherProfileSchema.index({ organization: 1, staff: 1 }, { unique: true });
const TeacherProfileModel = model("teacher_profile", teacherProfileSchema);
export default TeacherProfileModel;
