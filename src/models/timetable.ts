import { model, Schema } from "mongoose";

const timetableEntrySchema = new Schema(
  {
    day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    subject: { type: String, required: true, trim: true, maxlength: 100 },
    teacher: { type: String, trim: true, maxlength: 120 },
    room: { type: String, trim: true, maxlength: 60 },
    type: { type: String, enum: ["lesson", "break", "assembly", "activity"], default: "lesson" },
  },
  { _id: true },
);

const timetableSchema = new Schema(
  {
    organization: { type: Schema.Types.ObjectId, ref: "organization", required: true, index: true },
    class: { type: Schema.Types.ObjectId, ref: "class", required: true },
    session: { type: String, required: true },
    term: { type: String, required: true },
    entries: { type: [timetableEntrySchema], default: [] },
    updated_by: { type: Schema.Types.ObjectId, ref: "account" },
  },
  { timestamps: true },
);

timetableSchema.index({ organization: 1, class: 1, session: 1, term: 1 }, { unique: true });
const TimetableModel = model("timetable", timetableSchema);
export default TimetableModel;
