import { model, Schema } from "mongoose";

const studentProfileSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: "organization", required: true, index: true },
    account: { type: Schema.Types.ObjectId, ref: "account", required: true, unique: true },
    student: { type: Schema.Types.ObjectId, ref: "student", required: true },
    created_by: { type: Schema.Types.ObjectId, ref: "account" },
  },
  { timestamps: true },
);

studentProfileSchema.index({ organization: 1, student: 1 }, { unique: true });
const StudentProfileModel = model("student_profile", studentProfileSchema);
export default StudentProfileModel;
