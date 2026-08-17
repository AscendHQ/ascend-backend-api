import { model, Schema } from "mongoose";

import { EAttendanceStatus, IAttendanceDocument } from "../interface";

const attendanceSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    session: { type: String, required: true },
    term: { type: String, required: true },
    date: { type: String, required: true },
    records: [
      {
        student: {
          type: Schema.Types.ObjectId,
          ref: "student",
          required: true,
        },
        status: {
          type: String,
          enum: Object.values(EAttendanceStatus),
          required: true,
        },
        remark: { type: String, trim: true, maxlength: 250 },
      },
    ],
    recorded_by: { type: Schema.Types.ObjectId, ref: "account" },
  },
  { timestamps: true },
);

attendanceSchema.index(
  { organization: 1, class: 1, session: 1, term: 1, date: 1 },
  { unique: true },
);

const AttendanceModel = model<IAttendanceDocument>(
  "attendance",
  attendanceSchema,
);

export default AttendanceModel;
