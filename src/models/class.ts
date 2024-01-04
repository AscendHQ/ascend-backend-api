import { model, Schema } from "mongoose";
import {
  EClassLevel,
  EClassLevelSection,
  IClass,
  IClassDocument,
} from "../interface";

const classSchemaFields: Record<keyof IClass, any> = {
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  name: { type: String, required: true },
  level: { type: String, enum: Object.values(EClassLevel), required: true },
  section: {
    type: String,
    enum: Object.values(EClassLevelSection),
  },
  other_section: {
    type: String,
  },
};

const classSchema = new Schema(classSchemaFields, {
  timestamps: true,
});

const ClassModel = model<IClassDocument>("class", classSchema);
export default ClassModel;
