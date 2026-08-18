import { model, Schema } from "mongoose";

const teacherResultSubmissionSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    teacher_profile: {
      type: Schema.Types.ObjectId,
      ref: "teacher_profile",
      required: true,
    },
    class: { type: Schema.Types.ObjectId, ref: "class", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "subject", required: true },
    session: { type: String, required: true },
    term: { type: String, required: true },
    records: [
      {
        _id: false,
        student: {
          type: Schema.Types.ObjectId,
          ref: "student",
          required: true,
        },
        mid_term_test: { type: Number, required: true, min: 0 },
        ca_score: { type: Number, required: true, min: 0 },
        exam_score: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0, max: 100 },
        grade: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
      index: true,
    },
    submitted_at: Date,
    reviewed_by: { type: Schema.Types.ObjectId, ref: "account" },
    reviewed_at: Date,
    review_note: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

teacherResultSubmissionSchema.index(
  {
    organization: 1,
    teacher_profile: 1,
    class: 1,
    subject: 1,
    session: 1,
    term: 1,
  },
  { unique: true },
);

export default model(
  "teacher_result_submission",
  teacherResultSubmissionSchema,
);
