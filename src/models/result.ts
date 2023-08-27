import { model, Schema } from "mongoose";
import { EStatus, IResult, IResultDocument } from "../interface";

const resultSchemaFields: Record<keyof IResult, any> = {
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
  session: { type: String, required: true },
  term: { type: String, required: true },
  blocks: [
    {
      subject: {
        type: Schema.Types.ObjectId,
        ref: "subject",
      },
      mid_term_test: { type: Number, default: 0 },
      ca_score: { type: Number, default: 0 },
      exam_score: { type: Number, default: 0 },
      total: { type: Number, default: 0, min: 0, max: 100 },
    },
  ],
  status: { type: String, enum: EStatus, default: EStatus.APPROVED },
};

const resultSchema = new Schema(resultSchemaFields, {
  timestamps: true,
});

const ResultModel = model<IResultDocument>("result", resultSchema);
export default ResultModel;
