import { model, Schema } from "mongoose";
import { EAction, EGrade, EPsychomotor, EStatus, IResult, IResultDocument } from "../interface";

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
  psychomotors: [
    {
      psychomotor: { type: String, enum: EPsychomotor },
      grade: { type: String, enum: EGrade },
    },
  ],
  status: { type: String, enum: EStatus, default: EStatus.PENDING },
  action: { type: String, enum: EAction},
  teacher_remark: { type: String },
  principal_remark: { type: String },
};

const resultSchema = new Schema(resultSchemaFields, {
  timestamps: true,
  versionKey: false,
});

resultSchema.pre("save", function (next) {
  const result = this as IResultDocument;
  const status = result.status;
  if (status === EStatus.PENDING) {
    result.action = EAction.REGISTER;
  }
  if (status === EStatus.COMPLETED) {
    result.action = EAction.VIEW;
  }
  if (status === EStatus.IN_PROGRESS) {
    result.action = EAction.RESUME;
  }
  next();
}
);

const ResultModel = model<IResultDocument>("result", resultSchema);
export default ResultModel;
