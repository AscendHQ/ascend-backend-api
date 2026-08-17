import { model, Schema } from "mongoose";

const parentProfileSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: "account",
      required: true,
      unique: true,
    },
    children: {
      type: [{ type: Schema.Types.ObjectId, ref: "student" }],
      default: [],
    },
    created_by: { type: Schema.Types.ObjectId, ref: "account" },
  },
  { timestamps: true },
);

const ParentProfileModel = model("parent_profile", parentProfileSchema);
export default ParentProfileModel;
