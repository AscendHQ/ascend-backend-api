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

const SubjectRegistrationModel = model<ISubjectRegistrationDocument>(
  "subject_registration",
  subjectRegistrationSchema
);
export default SubjectRegistrationModel;
