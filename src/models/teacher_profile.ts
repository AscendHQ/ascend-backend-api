import { model, Schema } from "mongoose";

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
    classes: [{ type: Schema.Types.ObjectId, ref: "class" }],
    subjects: [{ type: Schema.Types.ObjectId, ref: "subject" }],
    created_by: { type: Schema.Types.ObjectId, ref: "account" },
  },
  { timestamps: true },
);

teacherProfileSchema.index({ organization: 1, staff: 1 }, { unique: true });
const TeacherProfileModel = model("teacher_profile", teacherProfileSchema);
export default TeacherProfileModel;
