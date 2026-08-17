import { model, Schema } from "mongoose";

const noticeSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: "organization", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    type: { type: String, enum: ["announcement", "event"], required: true },
    audience: { type: String, enum: ["all", "parents", "students", "teachers"], default: "all" },
    classes: { type: [{ type: Schema.Types.ObjectId, ref: "class" }], default: [] },
    starts_at: { type: Date, required: true },
    ends_at: { type: Date },
    is_published: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: "account" },
  },
  { timestamps: true },
);

noticeSchema.index({ organization: 1, starts_at: -1 });
const NoticeModel = model("notice", noticeSchema);
export default NoticeModel;
