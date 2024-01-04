import { model, Schema } from "mongoose";
import {
  EClassLevel,
  ESubjectType,
  ISubject,
  ISubjectDocument,
} from "../interface";

const subjectSchemaFields: Record<keyof ISubject, any> = {
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  name: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: Object.values(ESubjectType) },
  level: { type: String, enum: Object.values(EClassLevel) },
  classes: [{ type: Schema.Types.ObjectId, ref: "class" }],
};

const subjectSchema = new Schema(subjectSchemaFields, {
  timestamps: true,
});

const SubjectModel = model<ISubjectDocument>("subject", subjectSchema);
export default SubjectModel;
