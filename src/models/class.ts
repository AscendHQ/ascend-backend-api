import { model, Schema } from "mongoose";
import { EClassTerm, IClass, IClassDocument } from "../interface";

const classSchemaFields: Record<keyof IClass, any> = {
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  name: { type: String },
  size: { type: Number, default: 0 },
  session: { type: String },
  term: {
    type: String,
    enum: EClassTerm,
    default: EClassTerm.FIRST_TERM,
  },
};

const classSchema = new Schema(classSchemaFields, {
  timestamps: true,
});

const ClassModel = model<IClassDocument>("class", classSchema);
export default ClassModel;
