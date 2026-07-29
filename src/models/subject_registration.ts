import { model, Schema } from "mongoose";
import {
  ISubjectRegistration,
  ISubjectRegistrationDocument,
} from "../interface";

const subjectRegistrationSchemaFields: Record<keyof ISubjectRegistration, any> =
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "student",
      required: true,
    },
    class: { type: Schema.Types.ObjectId, ref: "class", required: true },
    session: { type: String, required: true },
    term: { type: String, required: true },
    additional_subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "subject",
      },
    ],
  };

const subjectRegistrationSchema = new Schema(subjectRegistrationSchemaFields, {
  timestamps: true,
});

subjectRegistrationSchema.index(
  { organization: 1, student: 1, class: 1, session: 1, term: 1 },
  { unique: true }
);

const SubjectRegistrationModel = model<ISubjectRegistrationDocument>(
  "subject_registration",
  subjectRegistrationSchema
);
export default SubjectRegistrationModel;
