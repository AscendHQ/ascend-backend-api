import { model, Schema } from "mongoose";

const cbtAttemptSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    exam: { type: Schema.Types.ObjectId, ref: "cbt_exam", required: true },
    student: { type: Schema.Types.ObjectId, ref: "student", required: true },
    answers: [
      {
        _id: false,
        question_id: { type: Schema.Types.ObjectId, required: true },
        selected_option: { type: Number, required: true, min: 0 },
      },
    ],
    started_at: { type: Date, required: true },
    expires_at: { type: Date, required: true },
    submitted_at: Date,
    status: {
      type: String,
      enum: ["in_progress", "submitted"],
      default: "in_progress",
      index: true,
    },
    score: { type: Number, min: 0 },
    total_marks: { type: Number, min: 1 },
    percentage: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true },
);

cbtAttemptSchema.index(
  { organization: 1, exam: 1, student: 1 },
  { unique: true },
);

export default model("cbt_attempt", cbtAttemptSchema);
