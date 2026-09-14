import { model, Schema } from "mongoose";

const cbtQuestionSchema = new Schema(
  {
    prompt: { type: String, required: true, trim: true, maxlength: 2000 },
    options: {
      type: [{ type: String, trim: true, maxlength: 500 }],
      required: true,
      validate: {
        validator: (options: string[]) =>
          options.length >= 2 && options.length <= 6,
        message: "Each question requires between 2 and 6 options",
      },
    },
    correct_option: { type: Number, required: true, min: 0 },
    marks: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: true },
);

const cbtExamSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    instructions: { type: String, trim: true, maxlength: 3000 },
    class: { type: Schema.Types.ObjectId, ref: "class", required: true },
    subject: { type: Schema.Types.ObjectId, ref: "subject", required: true },
    session: { type: String, required: true, trim: true },
    term: {
      type: String,
      enum: ["1st Term", "2nd Term", "3rd Term"],
      required: true,
    },
    duration_minutes: { type: Number, required: true, min: 1, max: 300 },
    starts_at: { type: Date, required: true },
    ends_at: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
      index: true,
    },
    questions: {
      type: [cbtQuestionSchema],
      validate: {
        validator: (questions: unknown[]) => questions.length > 0,
        message: "An examination requires at least one question",
      },
    },
    total_marks: { type: Number, required: true, min: 1 },
    created_by: { type: Schema.Types.ObjectId, ref: "account", required: true },
  },
  { timestamps: true },
);

cbtExamSchema.index({ organization: 1, class: 1, session: 1, term: 1 });

export default model("cbt_exam", cbtExamSchema);
