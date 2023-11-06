import { model, Schema } from "mongoose";
import {
  EStatus,
  ESubjectDuration,
  ISubject,
  ISubjectDocument,
} from "../interface";

const subjectSchemaFields: Record<keyof ISubject, any> = {
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  subject_name: { type: String, required: true },
  subject_code: { type: String, required: true },
  description: { type: String },
  classes_offering: [{ type: Schema.Types.ObjectId, ref: "class" }],
  staff: {
    type: Schema.Types.ObjectId,
    ref: "staff",
  },
  duration: {
    number: { type: Number, default: 1 },
    period: {
      type: String,
      enum: ESubjectDuration,
      default: ESubjectDuration.WEEK,
    },
  },
  status: {
    type: String,
    enum: EStatus,
    default: EStatus.PENDING,
  },
};

const subjectSchema = new Schema(subjectSchemaFields, {
  timestamps: true,
});

const SubjectModel = model<ISubjectDocument>("subject", subjectSchema);
export default SubjectModel;
